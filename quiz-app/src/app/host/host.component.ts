import { Component } from "@angular/core";
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';
import { CommEvent } from '../../../../server/src/main';
import { WebsocketService } from '../websocket.service';
import { Score, Screen } from '../screen/screen.component';

@Component({
    selector : 'host',
    templateUrl : './host.component.html',
    styleUrls : ['./host.styles.css']
})
export class HostComponent {
    public who : string;
    public scoreboard : Score[];
    public question : Screen;
    private socket$ : WebSocketSubject<CommEvent>;
    public displayedColumns : string[] = ['name', 'score', 'points'];

    constructor(public websocket : WebsocketService) {
        this.who = '';

        this.socket$ = websocket.openSocket();
        this.socket$.subscribe((msg : CommEvent) => {
            switch (msg.action) {
                case 'buzzed':
                    this.who = msg.name;
                    break;
                case 'scores':
                    this.scoreboard = msg.scores;
                    break;
                case 'question':
                    this.question = msg.question;
                    break;
            }
        });
        this.socket$.next({ action : 'host' });
    }

    public resetBuzzer() {
        this.who = '';
        this.socket$.next({ action : 'reset' });
    }

    public nextQuestion() {
        this.socket$.next({ action : 'next' });
        this.showQuestion();
    }

    public prevQuestion() {
        this.socket$.next({ action : 'prev' });
        this.showQuestion();
    }
    
    public showQuestion() {
        this.who = '';
        this.socket$.next({ action : 'show' });
    }

    public showAnswer() {
        this.socket$.next({ action : 'reveal' });
    }

    public incorrect() {
        this.socket$.next({ action : 'incorrect' });
    }

    public showScoreboard() {
        this.socket$.next({ action : 'scores' });
    }

    public addPoint(id : string) {
        this.socket$.next({ action : 'add_point', id : id });
    }

    public removePoint(id : string) {
        this.socket$.next({ action : 'remove_point', id : id });
    }

}