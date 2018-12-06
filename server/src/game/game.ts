import * as WebSocket from "ws";
import { Server } from 'ws';
import { CommEvent } from '../main';
import { Question } from '../../../quiz-app/src/app/screen/screen.component';

export interface Map<T> {
    [key : number]: T;
}

export interface Player {
    name : string;
    socket : WebSocket;
}

export class Game {
    private buzzed : boolean;
    private whoBuzzed : string;
    private buzzerid : number;
    private host : WebSocket;
    private screen : WebSocket;
    private playerMap : Map<Player>;
    private questions : Question[];
    private currentQuestion : number; // index in the array

    constructor() {
        this.buzzerid = 0;
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
                    case 'screen':
                        game.registerScreen(ws);
                        break;
                }
            });
        });
    }

    public buzz(id : number) {
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

    public nextQuestion() {
        if (this.screen) {
            this.screen.send(JSON.stringify({ action : 'question', question : this.questions[this.currentQuestion++]}));
        }
    }

    public registerHost(ws : WebSocket) {
        this.host = ws;
        ws.send(JSON.stringify({ action : 'host', success : true }));
    }

    public registerScreen(ws : WebSocket) {
        this.screen = ws;
        ws.send(JSON.stringify({ action : 'screen', success : true }));
    }

    public register(name : string, ws : WebSocket) {
        const id = this.buzzerid++;

        this.playerMap[id] = { name : name, socket : ws };

        ws.send(JSON.stringify({
            action : 'register',
            id : id,
            name : name
        }));
    }

    public reset() {
        this.buzzed = false;
        this.whoBuzzed = '';
    }
}