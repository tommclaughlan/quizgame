import { Component } from "@angular/core";
import { BuzzerService } from '../buzzer/buzzer.service';
import { HostService } from './host.service';
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';
import { CommEvent } from '../../../../server/src/main';


@Component({
    selector : 'host',
    templateUrl : './host.component.html'
})
export class HostComponent {
    public who : string;
    private socket$ : WebSocketSubject<CommEvent>;

    constructor(private buzzerService : BuzzerService, private hostService : HostService) {
        this.who = '';

        this.socket$ = new WebSocketSubject('ws://localhost:3000');
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

    public givePoints(name : string, points? : number) {
        if (!points) {
            points = 1;
        }
        this.hostService.givePoints(name, points).subscribe(result => {
            console.log('successfully added points');
        });
    }
}