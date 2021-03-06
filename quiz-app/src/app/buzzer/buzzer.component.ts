import { Component } from '@angular/core';
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';
import { CommEvent } from '../../../../server/src/main';
import { WebsocketService } from '../websocket.service';
import { LocalStorageService } from 'angular-2-local-storage';

@Component({
    selector : 'buzzer',
    templateUrl : './buzzer.component.html'
})
export class BuzzerComponent {
    public id : string;
    public name : string;
    public buzzed : boolean;
    public connected : boolean;

    private socket$ : WebSocketSubject<CommEvent>;

    constructor(public websocket : WebsocketService, private localStorageService : LocalStorageService) {
        this.buzzed = false;
        this.connectSocket();
    }

    public connectSocket() {
        this.socket$ = this.websocket.openSocket({
            next : (event : Event) => {
                this.connected = true;
            }
        }, {
            next : (closeEvent : CloseEvent) => {
                this.connected = false;
            }
        });
        this.socket$.subscribe((msg : CommEvent) => {
            if (msg.action === 'register') {
                this.id = msg.id;
                this.name = msg.name;
                this.localStorageService.set('buzzerid', msg.id);
            } else if (msg.action === 'buzzed') {
                this.buzzed = msg.buzzed;
                setTimeout(() => {
                    this.buzzed = false;
                }, 3000);
            } else if (msg.action === 'reregister') {
                // if the server can't reconnect us we have stale state - remove the buzzer id and connect fresh
                this.localStorageService.remove('buzzerid');
                this.name = undefined;
            }
        });

        const localId : string = this.localStorageService.get('buzzerid');
        if (localId) {
            this.reconnect(localId);
        }
    }

    public isRegistered() {
        return !!this.name;
    }

    public register(name : string) {
        this.socket$.next({ action : 'register', name : name });
    }

    public reconnect(id : string) {
        this.socket$.next({ action : 'reconnect', id : id });
    }

    public buzz() {
        this.socket$.next({ action : 'buzz', id : this.id });
    }
}