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
    locked : boolean;
}

@Component({
    selector : 'screen',
    templateUrl : './screen.component.html',
    styleUrls : ['./screen.styles.css']
})
export class ScreenComponent {
    public ready : boolean;
    public screen : Screen;
    public reveal : boolean;
    private socket$ : WebSocketSubject<CommEvent>;
    public displayedColumns : string[] = ['name', 'score'];
    private audio : HTMLAudioElement;

    constructor(public websocket : WebsocketService) {
        this.ready = false;
        this.reveal = false;
        this.socket$ = websocket.openSocket();
        this.socket$.subscribe((msg : CommEvent) => {
            switch(msg.action) {
                case 'screen':
                    this.reveal = false;
                    this.screen = msg.question;
                    if (msg.question && msg.question.data && msg.question.data.song) {
                        this.playAudio(msg.question.data.song);
                    }
                    break;
                case 'scores':
                    this.screen = {
                        type : 'scores',
                        data : msg.scores
                    };
                    this.playAudio('scores.mp3');
                    break;
                case 'round':
                    this.playAudio('next1.mp3');
                    break;
                case 'category':
                    this.playAudio('next2.mp3');
                    break;
                case 'reveal':
                    this.reveal = true;
                    this.playAudio('correct.mp3');
                    break;
                case 'incorrect':
                    this.playAudio('incorrect.mp3');
                    break;
                case 'buzz':
                    this.buzzerSound(msg.sound);
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
    
    public startGame() {
        this.ready = true;
        this.playAudio('intro.mp3');
    }

    public playAudio(name : string) {
        if (this.ready) {
            if (this.audio) {
                this.audio.pause();
                this.audio = null;
            }
            this.audio = new Audio();
            this.audio.src = `assets/sounds/${name}`;
            this.audio.load();
            this.audio.play();
        }
    }

    public buzzerSound(sound : string) {
        this.playAudio(sound);
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