import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {QuillModule } from 'ngx-quill';
import { RealtimeComponent } from './realtime/realtime.component';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { VersionComponent } from './version/version.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent, RealtimeComponent, VersionComponent],
  imports: [BrowserModule, FormsModule, QuillModule.forRoot(), AppRoutingModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
