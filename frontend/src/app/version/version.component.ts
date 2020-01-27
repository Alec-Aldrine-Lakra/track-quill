import { Component, OnInit } from '@angular/core';
import { VerhistoryService } from '../verhistory.service';
import moment from  'moment-timezone';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html'; 
@Component({
  selector: 'app-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.less']
})
export class VersionComponent implements OnInit {


  public val: any;
  private sharedb: any;
  public socket1: any;
  public connection: any;
  public roomid: string;
  constructor(private ver: VerhistoryService) {
    this.sharedb = require('@teamwork/sharedb/lib/client');
    this.sharedb.types.register(require('rich-text').type);
    // Open WebSocket connection to ShareDB server
    this.socket1 = new ReconnectingWebSocket('ws://localhost:8080/sharedb');
    this.connection = new this.sharedb.Connection(this.socket1);
    this.roomid = 'richtext99';
  }
  
  ngOnInit() {

    this.showVersion(Date.now());
    this.ver.getVersion(this.roomid).subscribe((val) => {
      this.val = val;
      for(let i=0; i< this.val.versions.length; i++) {
        this.createVersions(this.val.versions[i]);
      }
    },(err) => {
       alert(err);
    });
  }

  createVersions(elem: any) {
    let d = document.createElement('div');
    d.setAttribute('id', elem._id);
    d.setAttribute('class','padding');
    let s = document.createElement('span');
    let tz = new Date(parseInt(elem.name,10));
    let date = moment(tz).utcOffset(-tz.getTimezoneOffset()).format();
    d.setAttribute('timestamp',elem.timestamp);
    s.appendChild(document.createTextNode(`${date}`));
    d.appendChild(s);
    d.addEventListener('click',(e)=>{
      e.stopPropagation();
      this.showVersion(d.getAttribute('timestamp'));
    },false);
    document.querySelector('.versions').appendChild(d);
  }

  showVersion(time: any){
    this.connection.fetchSnapshotByTimestamp('examples', this.roomid, parseInt(time,10), (err,snapshot)=>{
      if(err){
        console.error(err);
      } else {
         const converter =  new QuillDeltaToHtmlConverter(snapshot.data.ops, {});
         const html = converter.convert();
         document.querySelector('.view').innerHTML = html;
      }
   });
  }
}
 