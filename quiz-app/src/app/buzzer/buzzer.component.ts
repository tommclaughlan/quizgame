import { Component } from "@angular/core";
import { BuzzerService } from './buzzer.service';

@Component({
    selector : 'buzzer',
    templateUrl : './buzzer.component.html'
})
export class BuzzerComponent {
    public name : string;
    public buzzed : boolean;

    constructor(private buzzerService : BuzzerService) {
        this.buzzed = false;

        buzzerService.hasBuzzer().subscribe((result : any) => {
            if (result) {
                this.name = result.name;
            }
        });
    }

    public isRegistered() {
        return !!this.name;
    }

    public register(name : string) {
        this.buzzerService.registerBuzzer(name).subscribe((result : any) => {
            this.name = result.name;
        });
    }

    public buzz() {
        this.buzzerService.buzz().subscribe((result : boolean) => {
            this.buzzed = result;
            setTimeout(() => {
                this.buzzed = false;
            }, 5000);
        });
    }
}