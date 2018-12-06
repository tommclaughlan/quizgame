import { Component } from "@angular/core";
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';
import { CommEvent } from '../../../../server/src/main';
import { WebsocketService } from '../websocket.service';


@Component({
    selector : 'host',
    templateUrl : './host.component.html'
})
export class HostComponent {
    public who : string;
    private socket$ : WebSocketSubject<CommEvent>;

    constructor(public websocket : WebsocketService) {
        this.who = '';

        this.socket$ = websocket.openSocket();
        this.socket$.subscribe((msg : CommEvent) => {
            if (msg.action === 'buzzed') {
                this.who = msg.name;
            }
        });
        this.socket$.next({ action : 'host' });
    }

    public resetBuzzer() {
        this.who = '';
        this.socket$.next({ action : 'reset' });
    }

}