import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {QuillModule } from 'ngx-quill';
import { RealtimeComponent } from './realtime/realtime.component';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [AppComponent, RealtimeComponent],
  imports: [BrowserModule, FormsModule, QuillModule.forRoot()],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
