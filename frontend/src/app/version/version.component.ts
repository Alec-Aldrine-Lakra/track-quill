import { Component, OnInit, ViewChild } from '@angular/core';
import { VerhistoryService } from '../verhistory.service';
import moment from  'moment-timezone';
import { QuillEditorComponent } from 'ngx-quill';
import ReconnectingWebSocket from 'reconnecting-websocket';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
import {InsTrack, DelTrack} from '../track-comments';
const Delta = Quill.import('delta');
const Font = Quill.import('formats/font');
Font.whitelist = ['arial', 'times', 'verdana', 'roboto', 'lato', 'ubuntu'];
import { Router } from '@angular/router';

Quill.register(Font, true);
Quill.register(InsTrack, true);
Quill.register(DelTrack, true);

let Inline = Quill.import('blots/inline');
class ChangeBlot extends Inline { }
ChangeBlot.blotName = 'changeblot';
ChangeBlot.tagName = 'span';
ChangeBlot.className = 'viewchange';
Quill.register(ChangeBlot,true);

@Component({
  selector: 'app-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.less']
})
export class VersionComponent implements OnInit {

  @ViewChild('primary') editor: QuillEditorComponent;
  @ViewChild('secondary') hideditor: QuillEditorComponent;
  public val: any;
  private sharedb: any;
  public socket1: any;
  public connection: any;
  public roomid: string;
  public modules: any;
  public currentOps: any;
  public showChanges: boolean;
  public doc: any;
  public flag=0;

  constructor(private ver: VerhistoryService, private router: Router) {
    this.sharedb = require('@teamwork/sharedb/lib/client');
    this.sharedb.types.register(require('rich-text').type);
    this.socket1 = new ReconnectingWebSocket('ws://localhost:8080/sharedb');
    this.connection = new this.sharedb.Connection(this.socket1);
    this.roomid = 'richtext99';
    this.doc = this.connection.get('examples', this.roomid);
  }
  
  ngOnInit() {

    this.modules =  { //editor modules
      toolbar: false,
      table: true,
    };
    
    this.doc.subscribe((err) => { // Get initial value of document and subscribe to changes
      if (err) {
          throw err;
      }
    })

    this.ver.getVersion(this.roomid).subscribe((val) => { // getting all the saved versions
      this.val = val;
      for(let i = this.val.versions.length-1; i>=0; i--) {
        this.createVersions(this.val.versions[i]); // creating visual versions
      }
    },(err) => {
        alert(err);
    });
  }

  createVersions(elem: any) { //creating DOM for versions
    let d = document.createElement('div');
    d.setAttribute('id', elem._id);
    d.setAttribute('class','padding');
    let s = document.createElement('span');
    let tz = new Date(parseInt(elem.name,10));
    let date = moment(tz).utcOffset(-tz.getTimezoneOffset()).format('MMMM Do YYYY, h:mm:ss a');
    d.setAttribute('timestamp',elem.timestamp);
    s.appendChild(document.createTextNode(`${date}`));
    s.appendChild(document.createElement(`br`));
    s.appendChild(document.createElement(`br`));
    
    let button = document.createElement('button');
    button.appendChild(document.createTextNode('Restore'));
    button.setAttribute('class','restore');
    s.appendChild(button);

    button.addEventListener('click',(e)=>{
      e.stopPropagation();
      this.restoreVersion(d.getAttribute('timestamp'));
    })

    d.appendChild(s);
    d.addEventListener('click',(e)=>{
      e.stopPropagation();
      var current = document.getElementsByClassName("pactive");
      if(current.length>0){
        current[0].className = current[0].className.replace(" pactive", "");
      }
      d.classList.add("pactive");
      this.showDiff();
    });

    if(document.querySelector('.versions').childNodes.length===0){ // for the current version 
      d.classList.add("pactive");
      this.showVersion(d.getAttribute('timestamp'));
    }

    document.querySelector('.versions').appendChild(d);
  }

  showVersion(time: string){
    this.connection.fetchSnapshotByTimestamp('examples', this.roomid, parseInt(time,10), (err,snapshot)=>{
      if(err){
        console.error(err);
      } else {
        this.editor.quillEditor.root.innerHTML = "";
        this.currentOps = snapshot.data.ops;
        this.editor.quillEditor.updateContents(snapshot.data.ops, 'quill');
      }
   });
  }

  restoreVersion(time: string){
    this.connection.fetchSnapshotByTimestamp('examples', this.roomid, parseInt(time,10), (err,snapshot)=>{
      if(err){
        console.error(err);
      } else {
        let delta1 = this.editor.quillEditor.setContents([{ insert: '\n' }]);
        let delta2 = this.editor.quillEditor.updateContents(snapshot.data.ops, 'quill');
        this.doc.submitOp(delta1, {source: 'quill'});
        this.doc.submitOp(delta2, {source: 'quill'});
        this.router.navigate(['/']);
      }
   });
  }

  async getDiff(timestamp2: string) {
    this.connection.fetchSnapshotByTimestamp('examples', this.roomid, parseInt(timestamp2,10), (err,snapshot2)=>{
      if(err){
        console.error(err);
      } else {

        this.hideditor.quillEditor.root.innerHTML="";
        this.hideditor.quillEditor.updateContents(snapshot2.data.ops);
        let oldContent = this.hideditor.quillEditor.getContents();
        let newContent = this.editor.quillEditor.getContents();
        let diff = oldContent.diff(newContent);
        console.log(diff);

        for (var i = 0; i < diff.ops.length; i++) {
          var op = diff.ops[i];
          if (op.hasOwnProperty('insert')) {
              op.attributes  = op.attributes || {};
              op.attributes.changeblot = "true";
              op.attributes.background= "#4681ef";
              op.attributes.color= "#003700";
          }
          if (op.hasOwnProperty('delete')) {
            op.retain = op.delete;
            delete op.delete;
            op.attributes  = op.attributes || {};
            op.attributes.changeblot = "true";
            op.attributes.background= "#fd5e53";
            op.attributes.color= "#003700";
          }
        }
        let adjusted = oldContent.compose(diff);
        this.editor.quillEditor.root.innerHTML="";
        this.editor.quillEditor.updateContents(adjusted);  
      }
    });
  }

  showDiff(){
    let nodes = document.querySelectorAll('.padding');
    let diffB: any, timestamp2;
    this.showVersion(document.querySelector('.pactive').getAttribute('timestamp'));

    if(this.showChanges){
      for(let i = 0; i < nodes.length; i++){
        if(nodes[i].className.indexOf("pactive")>=0){
          diffB = (i+1)<nodes.length?nodes[i+1]: nodes[i]; // getting the previous version
          timestamp2 = diffB.getAttribute('timestamp'); // getting timestamp of previous version
          this.getDiff(timestamp2); // getiing diff html between latest and previous version
        }
      }
    }
  }
}
 