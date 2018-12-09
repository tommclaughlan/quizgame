import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { 
  MatButtonModule,
  MatInputModule,
  MatCardModule,
  MatToolbarModule,
  MatTableModule,
  MatIconModule,
  MatDividerModule
} from '@angular/material';
import { LocalStorageModule } from 'angular-2-local-storage';

import { AppComponent } from './app.component';
import { BuzzerComponent } from './buzzer/buzzer.component';
import { BuzzerService } from './buzzer/buzzer.service';
import { HostComponent } from './host/host.component';
import { HostService } from './host/host.service';
import { ScreenComponent } from './screen/screen.component';
import { ScreenService } from './screen/screen.service';
import { WebsocketService } from './websocket.service';
import { BackwardsPipe } from './screen/screen.pipes';
import { FlexLayoutModule } from '@angular/flex-layout';

const APP_ROUTES = [
  { path : 'buzzer', component : BuzzerComponent },
  { path : 'host', component : HostComponent },
  { path : 'screen', component : ScreenComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    BuzzerComponent,
    HostComponent,
    ScreenComponent,
    BackwardsPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatInputModule,
    MatCardModule,
    MatToolbarModule,
    MatTableModule,
    MatIconModule,
    MatDividerModule,
    RouterModule.forRoot(APP_ROUTES),
    FlexLayoutModule,
    LocalStorageModule.withConfig({
        prefix : 'quiz',
        storageType : 'localStorage'
    })
  ],
  providers: [
    BuzzerService,
    HostService,
    ScreenService,
    WebsocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
