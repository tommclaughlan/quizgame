import { Component } from "@angular/core";
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';
import { CommEvent } from '../../../../server/src/main';
import { WebsocketService } from '../websocket.service';

export interface Question {
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
    public question : Question;
    private socket$ : WebSocketSubject<CommEvent>;

    constructor(public websocket : WebsocketService) {
        this.socket$ = websocket.openSocket();
        this.socket$.subscribe((msg : CommEvent) => {
            if (msg.action === 'question') {
                this.question = msg.question;
            }
        });
        this.socket$.next({ action : 'screen' });
    }

    public getType() {
        if (this.question) {
            return this.question.type;
        }
        return false;
    }

    public getQuestion() {
        return this.question;
    }
}