import { Injectable } from '@angular/core';
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';
import { CommEvent } from '../../../server/src/main';
import { NextObserver } from 'rxjs/index';


@Injectable()
export class WebsocketService {
    public openSocket(openObserver? : NextObserver<Event>, closeObserver? : NextObserver<CloseEvent>) : WebSocketSubject<CommEvent> {
        return new WebSocketSubject({
            url : `ws://${window.location.hostname}:3000`,
            openObserver : openObserver,
            closeObserver : closeObserver
        });
    }
}