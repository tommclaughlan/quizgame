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
    private socket$ : WebSocketSubject<CommEvent>;
    public displayedColumns : string[] = ['name', 'score'];

    constructor(public websocket : WebsocketService) {
        this.socket$ = websocket.openSocket();
        this.socket$.subscribe((msg : CommEvent) => {
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