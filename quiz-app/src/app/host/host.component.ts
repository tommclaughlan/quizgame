import { Component } from "@angular/core";
import { BuzzerService } from '../buzzer/buzzer.service';
import { HostService } from './host.service';


@Component({
    selector : 'host',
    templateUrl : './host.component.html'
})
export class HostComponent {
    private interval;
    public who : string;

    constructor(private buzzerService : BuzzerService, private hostService : HostService) {
        this.who = '';
    }

    public whoBuzzed() {
        this.buzzerService.whoBuzzed().subscribe((result : any) => {
            if (result) {
                this.who = result.name;
                clearInterval(this.interval);
                this.interval = null;
            }
        });
    }

    public resetBuzzer() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.who = '';
        this.buzzerService.resetBuzzer().subscribe(result => {
            this.interval = setInterval(() => {
                this.whoBuzzed();
            }, 1000);
        });
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