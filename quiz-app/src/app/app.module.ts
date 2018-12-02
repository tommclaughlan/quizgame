import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BuzzerComponent } from './buzzer/buzzer.component';
import { BuzzerService } from './buzzer/buzzer.service';
import { HostComponent } from './host/host.component';
import { HostService } from './host/host.service';
import { ScreenComponent } from './screen/screen.component';
import { ScreenService } from './screen/screen.service';

const APP_ROUTES = [
  { path : 'buzzer', component : BuzzerComponent },
  { path : 'host', component : HostComponent },
  { path : 'screen', component : ScreenComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    BuzzerComponent,
    HostComponent,
    ScreenComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(APP_ROUTES)
  ],
  providers: [
    BuzzerService,
    HostService,
    ScreenService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
