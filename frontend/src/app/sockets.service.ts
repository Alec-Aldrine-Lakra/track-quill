import { Injectable } from '@angular/core';
import ReconnectingWebSocket from 'reconnecting-websocket';

@Injectable({
  providedIn: 'root'
})
export class SocketsService {

  sharedb: any;
  socket1: any;
  socket2: any;
  constructor() {
    this.sharedb = require('@teamwork/sharedb/lib/client');
    this.sharedb.types.register(require('rich-text').type);
    // Open WebSocket connection to ShareDB server
    this.socket1 = new ReconnectingWebSocket('ws://localhost:8080/sharedb');
    this.socket2 = new ReconnectingWebSocket('ws://localhost:8080/cursors');
   }
}
