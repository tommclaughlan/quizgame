import { Component } from "@angular/core";
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';
import { CommEvent } from '../../../../server/src/main';
import { WebsocketService } from '../websocket.service';

export interface Screen {
    type : string;
    data : any;
}

export interface Score {
    name : string;
    id : string;
    score : number;
}

@Component({
    selector : 'screen',
    templateUrl : './screen.component.html'
})
export class ScreenComponent {
    public screen : Screen;
    public reveal : boolean;
    private socket$ : WebSocketSubject<CommEvent>;
    public displayedColumns : string[] = ['name', 'score'];

    constructor(public websocket : WebsocketService) {
        this.reveal = false;
        this.socket$ = websocket.openSocket();
        this.socket$.subscribe((msg : CommEvent) => {
            switch(msg.action) {
                case 'screen':
                    this.reveal = false;
                    this.screen = msg.question;
                    break;
                case 'scores':
                    this.screen = {
                        type : 'scores',
                        data : msg.scores
                    };
                    break;
                case 'reveal':
                    this.reveal = true;
                    break;
            }
            if (msg.action === 'screen') {
                this.screen = msg.question;
            } else if (msg.action === 'scores') {
                this.screen = {
                    type : 'scores',
                    data : msg.scores
                };
            }
        });

        this.socket$.next({ action : 'screen' });
    }

    public getType() {
        if (this.screen) {
            return this.screen.type;
        }
        return false;
    }

    public getScreenData() {
        return this.screen.data;
    }
}