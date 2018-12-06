import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';
import { CommEvent } from '../../../server/src/main';


@Injectable()
export class WebsocketService {
    public openSocket() : WebSocketSubject<CommEvent> {
        return new WebSocketSubject(`ws://${window.location.hostname}:3000`);
    }
}