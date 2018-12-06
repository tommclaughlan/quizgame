import { Component } from "@angular/core";
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';
import { CommEvent } from '../../../../server/src/main';
import { WebsocketService } from '../websocket.service';

export interface Question {
    type : string;
    data : any;
}

@Component({
    selector : 'screen',
    templateUrl : './screen.component.html'
})
export class ScreenComponent {
    public question : Question;
    private socket$ : WebSocketSubject<CommEvent>;

    constructor(public websocket : WebsocketService) {
        console.log('hello');
        this.socket$ = websocket.openSocket();
        this.socket$.subscribe((msg : CommEvent) => {
            if (msg.action === 'question') {
                this.question = msg.question;
            }
        });

        this.question = {
            type : 'answersmash',
            data : {
                image : 'gimli.jpeg',
                question : 'Which band had their only UK number 1 with "Rollin\'"?'
            }
        };
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