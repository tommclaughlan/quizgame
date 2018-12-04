import { Component } from '@angular/core';
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';
import { CommEvent } from '../../../../server/src/main';

@Component({
    selector : 'buzzer',
    templateUrl : './buzzer.component.html'
})
export class BuzzerComponent {
    private id : number;
    public name : string;
    public buzzed : boolean;

    private socket$ : WebSocketSubject<CommEvent>;

    constructor() {
        this.buzzed = false;

        this.socket$ = new WebSocketSubject(`ws://localhost:3000`);
        this.socket$.subscribe((msg : CommEvent) => {
            if (msg.action === 'register') {
                this.id = msg.id;
                this.name = msg.name;
            } else if (msg.action === 'buzzed') {
                this.buzzed = msg.buzzed;
                setTimeout(() => {
                    this.buzzed = false;
                }, 5000);
            }
        });
    }

    public isRegistered() {
        return !!this.name;
    }

    public register(name : string) {
        this.socket$.next({ action : 'register', name : name });
    }

    public buzz() {
        this.socket$.next({ action : 'buzz', id : this.id });
    }
}