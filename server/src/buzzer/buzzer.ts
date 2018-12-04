import * as WebSocket from "ws";
import { Server } from 'ws';
import { CommEvent } from '../main';

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
    private playerMap : Map<Player>;

    constructor() {
        this.buzzerid = 0;
        this.buzzed = true;
        this.whoBuzzed = '';
        this.playerMap = {};
    }

    public static create(wss : Server) {
        const buzzer = new Game();

        wss.on('connection', (ws : WebSocket) => {
            ws.on('message', (msg : string) => {
                const message = JSON.parse(msg) as CommEvent;
                switch (message.action) {
                    case 'register':
                        buzzer.register(message.name, ws);
                        break;
                    case 'host':
                        buzzer.registerHost(ws);
                        break;
                    case 'buzz':
                        buzzer.buzz(message.id);
                        break;
                    case 'reset':
                        buzzer.reset();
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

    public registerHost(ws : WebSocket) {
        this.host = ws;
        ws.send(JSON.stringify({ action : 'host', success : true }));
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