import * as WebSocket from "ws";
import { Server } from 'ws';
import { CommEvent } from '../main';
import { Screen, Score } from '../../../quiz-app/src/app/screen/screen.component';
import * as crypto from 'crypto';
import * as fs from 'fs';

export interface Map<T> {
    [key : number]: T;
}

export interface Player {
    name : string;
    socket? : WebSocket;
    score : number;
    sound : string;
    locked : boolean;
}

export class Game {
    private buzzed : boolean;
    private whoBuzzed : string;
    private locked : string[];
    private host : WebSocket;
    private screen : WebSocket;
    private playerMap : Map<Player>;
    private questions : Screen[];
    private currentQuestion : number; // index in the array
    private sounds : string[];
    private playerMapFile : string = 'playermap.txt';

    constructor() {
        this.locked = [];
        this.buzzed = true;
        this.whoBuzzed = '';
        this.playerMap = {};
        this.sounds = ['1','2','3','4','5','6','7','8','9']; // corresponding to wavs in the src/assets/sounds folder

        this.questions = require('../questions/tamworth.json').questions;
        this.currentQuestion = 0;

        try {
            this.playerMap = JSON.parse(fs.readFileSync(this.playerMapFile, { encoding : 'utf8' }));
        } catch (e) {
            console.log('Failed to read playerMap from file');
            console.log(e);
        }
    }

    public static create(wss : Server) {
        const game = new Game();

        wss.on('connection', (ws : WebSocket) => {
            ws.on('message', (msg : string) => {
                const message = JSON.parse(msg) as CommEvent;
                switch (message.action) {
                    case 'register':
                        game.register(message.name, ws);
                        break;
                    case 'reconnect':
                        game.reconnect(message.id, ws);
                        break;
                    case 'host':
                        game.registerHost(ws);
                        break;
                    case 'buzz':
                        game.buzz(message.id);
                        break;
                    case 'reset':
                        game.reset();
                        break;
                    case 'next':
                        game.nextQuestion();
                        break;
                    case 'prev':
                        game.prevQuestion();
                        break;
                    case 'show':
                        game.showQuestion();
                        game.reset();
                        break;
                    case 'reveal':
                        game.showAnswer();
                        break;
                    case 'incorrect':
                        game.incorrect();
                        break;
                    case 'screen':
                        game.registerScreen(ws);
                        game.showQuestion();
                        break;
                    case 'scores':
                        game.showScoreboard();
                        break;
                    case 'add_point':
                        game.addPoints(message.id, 1);
                        break;
                    case 'remove_point':
                        game.addPoints(message.id, -1);
                        break;
                }
            });
        });
    }

    private hostAlive() {
        return this.host && this.host.readyState === this.host.OPEN;
    }

    private screenAlive() {
        return this.screen && this.screen.readyState === this.screen.OPEN;
    }

    private getScores() {
        const scoreboard : Score[] = [];

        for (const id in this.playerMap) {
            const player = this.playerMap[id];

            if (player.socket && player.socket.readyState === player.socket.OPEN) {
                scoreboard.push({ name : player.name, id : id, score : player.score, locked : player.locked });
            }
        }
        return { action : 'scores', scores : scoreboard };
    }

    public buzz(id : string) {
        const player = this.playerMap[id];
        let result = { action : 'buzzed', buzzed : false };
        if (!this.buzzed && !player.locked) {
            this.buzzed = true;
            this.whoBuzzed = id;
            result.buzzed = true;
            
            if (this.hostAlive()) {
                this.host.send(JSON.stringify({ action : 'buzzed', name : player.name }));
            }
            if (this.screenAlive()) {
                this.screen.send(JSON.stringify({ action : 'buzz', sound : player.sound }));
            }
        }

        if (player.socket && player.socket.readyState === player.socket.OPEN) {
            player.socket.send(JSON.stringify(result));
        }
    }

    public addPoints(id : string, points : number) {
        this.playerMap[id].score += points;

        if (this.hostAlive()) {
            this.host.send(JSON.stringify(this.getScores()));
        }
    }

    public nextQuestion() {
        if (this.currentQuestion < this.questions.length - 1) {
            this.currentQuestion++;
        }
        if (this.hostAlive()) {
            this.host.send(JSON.stringify({ action : 'question', question : this.questions[this.currentQuestion] }));
        }
    }

    public prevQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
        }
        if (this.hostAlive()) {
            this.host.send(JSON.stringify({ action : 'question', question : this.questions[this.currentQuestion] }));
        }
    }

    public showQuestion() {
        for (let id in this.playerMap) {
            this.playerMap[id].locked = false;
        }

        if (this.screenAlive()) {
            const currentQuestion = this.questions[this.currentQuestion];
            this.screen.send(JSON.stringify({ action : 'screen', question : currentQuestion}));
            if (currentQuestion.type === 'round') {
                this.screen.send(JSON.stringify({ action : 'round' }));
            } else if (currentQuestion.type === 'category') {
                this.screen.send(JSON.stringify({ action : 'category' }));
            }
        }
        
        if (this.hostAlive()) {
            this.host.send(JSON.stringify(this.getScores()));
        }
    }

    public showAnswer() {
        if (this.screenAlive()) {
            this.screen.send(JSON.stringify({ action : 'reveal' }));
        }
    }

    public incorrect() {
        this.buzzed = false;
        if (this.whoBuzzed) {
            this.playerMap[this.whoBuzzed].locked = true;
        }
        if (this.screenAlive()) {
            this.screen.send(JSON.stringify({ action : 'incorrect' }));
        }
        if (this.hostAlive()) {
            this.host.send(JSON.stringify(this.getScores()));
        }
    }

    public showScoreboard() {
        if (this.screenAlive()) {
            this.screen.send(JSON.stringify(this.getScores()));
        }
    }

    public registerHost(ws : WebSocket) {
        this.host = ws;
        ws.send(JSON.stringify({ action : 'host', success : true }));
        ws.send(JSON.stringify(this.getScores()));
        ws.send(JSON.stringify({ action : 'question', question : this.questions[this.currentQuestion] }));
    }

    public registerScreen(ws : WebSocket) {
        this.screen = ws;
        ws.send(JSON.stringify({ action : 'screen', success : true }));
    }

    public register(name : string, ws : WebSocket) {
        const hash = crypto.createHmac('sha256', 'xmas')
            .update(name + new Date())
            .digest('base64');
        const id = hash;

        const soundIndex = Math.floor(Math.random() * this.sounds.length);
        const sound : string = this.sounds.splice(soundIndex, 1)[0] + '.wav';

        this.playerMap[id] = { name : name, socket : ws, score : 0, sound : sound, locked : false };

        // we can't serialse the websocket, but we don't need that for persistence anyway as reconnect is needed.
        let tmpPlayerMap = this.playerMap;
        for (let id in tmpPlayerMap) {
            delete tmpPlayerMap[id].socket;
        }

        fs.writeFile(this.playerMapFile, JSON.stringify(tmpPlayerMap), 'utf8', () => { console.log('saved playermap'); });

        ws.send(JSON.stringify({
            action : 'register',
            id : `${id}`,
            name : name
        }));

        if (this.hostAlive()) {
            this.host.send(JSON.stringify(this.getScores()));
        }
    }

    public reconnect(id : string, ws : WebSocket) {
        const player = this.playerMap[id];
        if (player) {
            player.socket = ws;
            ws.send(JSON.stringify({
                action : 'register',
                id : id,
                name : player.name
            }));
        } else {
            ws.send(JSON.stringify({
                action : 'reregister'
            }));
        }
        
        if (this.hostAlive()) {
            this.host.send(JSON.stringify(this.getScores()));
        }
    }

    public reset() {
        this.buzzed = false;
        this.whoBuzzed = '';
    }
}