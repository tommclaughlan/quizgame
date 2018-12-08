import * as WebSocket from "ws";
import { Server } from 'ws';
import { CommEvent } from '../main';
import { Screen, Score } from '../../../quiz-app/src/app/screen/screen.component';

export interface Map<T> {
    [key : number]: T;
}

export interface Player {
    name : string;
    socket : WebSocket;
    score : number;
}

export class Game {
    private buzzed : boolean;
    private whoBuzzed : string;
    private buzzerid : number;
    private host : WebSocket;
    private screen : WebSocket;
    private playerMap : Map<Player>;
    private questions : Screen[];
    private currentQuestion : number; // index in the array

    constructor() {
        this.buzzerid = 1;
        this.buzzed = true;
        this.whoBuzzed = '';
        this.playerMap = {};

        this.questions = require('../questions/christmas1.json').questions;
        this.currentQuestion = 0;
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
                        break;
                    case 'reveal':
                        game.showAnswer();
                        break;
                    case 'screen':
                        game.registerScreen(ws);
                        break;
                    case 'scores':
                        game.showScoreboard();
                        break;
                }
            });
        });
    }

    private getScores() {
        const scoreboard : Score[] = [];

        for (const id in this.playerMap) {
            const player = this.playerMap[id];

            if (player.socket.readyState === player.socket.OPEN) {
                scoreboard.push({ name : player.name, id : id, score : player.score });
            }
        }
        return { action : 'scores', scores : scoreboard };
    }

    public buzz(id : string) {
        const player = this.playerMap[id];
        let result = { action : 'buzzed', buzzed : false };
        if (!this.buzzed) {
            this.buzzed = true;
            this.whoBuzzed = player.name;
            result.buzzed = true;
        }
        player.socket.send(JSON.stringify(result));

        if (this.host) {
            this.host.send(JSON.stringify({ action : 'buzzed', name : player.name }));
        }
    }

    public addPoints(id : number, points : number) {
        this.playerMap[id].score += points;

        if (this.host) {
            this.host.send(JSON.stringify(this.getScores()));
        }
    }

    public nextQuestion() {
        if (this.currentQuestion < this.questions.length - 1) {
            this.currentQuestion++;
        }
        if (this.host) {
            this.host.send(JSON.stringify({ action : 'question', questionNum : this.currentQuestion }));
        }
    }

    public prevQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
        }
        if (this.host) {
            this.host.send(JSON.stringify({ action : 'question', questionNum : this.currentQuestion }));
        }
    }

    public showQuestion() {
        if (this.screen) {
            this.screen.send(JSON.stringify({ action : 'screen', question : this.questions[this.currentQuestion]}));
        }
    }

    public showAnswer() {
        if (this.screen) {
            this.screen.send(JSON.stringify({ action : 'reveal' }));
        }
    }

    public showScoreboard() {
        if (this.screen) {
            this.screen.send(JSON.stringify(this.getScores()));
        }
    }

    public registerHost(ws : WebSocket) {
        this.host = ws;
        ws.send(JSON.stringify({ action : 'host', success : true }));
        ws.send(JSON.stringify(this.getScores()));
        ws.send(JSON.stringify({ action : 'question', questionNum : this.currentQuestion }));
    }

    public registerScreen(ws : WebSocket) {
        this.screen = ws;
        ws.send(JSON.stringify({ action : 'screen', success : true }));
    }

    public register(name : string, ws : WebSocket) {
        const id = this.buzzerid++;

        this.playerMap[id] = { name : name, socket : ws, score : 0 };

        ws.send(JSON.stringify({
            action : 'register',
            id : `${id}`,
            name : name
        }));

        if (this.host) {
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
    }

    public reset() {
        this.buzzed = false;
        this.whoBuzzed = '';
    }
}