import { ChangeDetectionStrategy, ViewChild, Component, OnInit, OnDestroy } from '@angular/core';

import { QuillEditorComponent } from 'ngx-quill';
import ReconnectingWebSocket from 'reconnecting-websocket';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
const Delta = Quill.import('delta');
import * as QuillTableUI from 'quill-table-ui';
import {InsTrack, DelTrack, Comment} from './track-comments';
import QuillCursors from 'quill-cursors';
import ImageResize from 'quill-image-resize';
import {VerhistoryService} from '../verhistory.service';

const Font = Quill.import('formats/font');
Font.whitelist = ['arial', 'times', 'verdana', 'roboto', 'lato', 'ubuntu'];

Quill.register({
  'modules/tableUI': QuillTableUI.default,
  'modules/imageResize': ImageResize,
  'modules/cursors': QuillCursors,
}, true);

Quill.register(Font, true);
Quill.register(InsTrack, true);
Quill.register(DelTrack, true);
Quill.register(Comment, true);

const jwtDecode = require('jwt-decode');
import moment from 'moment-timezone';
import chance from 'chance';

@Component({
  selector: 'app-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class RealtimeComponent  implements OnInit, OnDestroy {

  private static palette: string[] = ['#011f4b', '#009688', '#ee4035', '#f37736', '#7bc043', '#854442', '#ffa700', '#d11141', '#ff3377', '#8d5524'];
  @ViewChild(QuillEditorComponent, { static: true }) editor: QuillEditorComponent;
  content = '';
  public updated: any;
  public icons: any;
  public chance: any;
  public modules: any;
  public commentbutton: any;
  public fullscreenbutton: any;
  private cursorModule: any;
  private doc: any;
  private connection: any;
  private sharedb: any;
  private socket1: any;
  private socket2: any;
  private id: string;
  private color: string;
  private name: string;
  private roomid: string;
  private comment: string;
  private range: any;
  private text: string;
  private pageR: number;
  private fScreen: boolean;
  private authorButton: any;
  public trackChanges: boolean;
  private colorid: number;
  public bindings: any;
  public popuptop: number;
  public popupvisible = true;
  public quilltoolbar: any;

  // public auth: AuthService
  constructor(private ver: VerhistoryService) {
    this.trackChanges = false;
    window.onbeforeunload = () => {
      sessionStorage.clear();
    };
    this.chance = chance.Chance();
    this.sharedb = require('@teamwork/sharedb/lib/client');
    this.sharedb.types.register(require('rich-text').type);
    // Open WebSocket connection to ShareDB server
    this.socket1 = new ReconnectingWebSocket('ws://localhost:8080/sharedb');
    this.socket2 = new ReconnectingWebSocket('ws://localhost:8080/cursors');
    this.connection = new this.sharedb.Connection(this.socket1);
  }

  private get tableModule() {
    return this.editor.quillEditor.getModule('table');
  }

  private addNewtable(x: number, y: number): void {
    this.tableModule.insertTable(x, y);
  }

  ngOnInit() {

    this.fScreen = false;
    this.icons = Quill.import('ui/icons');
    this.icons['author'] =     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19.07 4.93l-1.41 1.41C19.1 7.79 20 9.79 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.16 6.57 6 9.03 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.66-.67-3.16-1.76-4.24l-1.41 1.41C15.55 9.9 16 10.9 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-1.86 1.28-3.41 3-3.86v2.14c-.6.35-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V2h-1C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z"/></svg>';
    this.icons['comment'] =    '<svg xmlns="http://www.w3.org/2000/svg" viewbox="-21 -47 682.66669 682" ><path d="m552.011719-1.332031h-464.023438c-48.515625 0-87.988281 39.472656-87.988281 87.988281v283.972656c0 48.421875 39.300781 87.824219 87.675781 87.988282v128.871093l185.183594-128.859375h279.152344c48.515625 0 87.988281-39.472656 87.988281-88v-283.972656c0-48.515625-39.472656-87.988281-87.988281-87.988281zm-83.308594 330.011719h-297.40625v-37.5h297.40625zm0-80h-297.40625v-37.5h297.40625zm0-80h-297.40625v-37.5h297.40625zm0 0"/></svg>';
    this.icons['fullscreen'] = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M21.414 18.586l2.586-2.586v8h-8l2.586-2.586-5.172-5.172 2.828-2.828 5.172 5.172zm-13.656-8l2.828-2.828-5.172-5.172 2.586-2.586h-8v8l2.586-2.586 5.172 5.172zm10.828-8l-2.586-2.586h8v8l-2.586-2.586-5.172 5.172-2.828-2.828 5.172-5.172zm-8 13.656l-2.828-2.828-5.172 5.172-2.586-2.586v8h8l-2.586-2.586 5.172-5.172z"/></svg>';
    this.pageR = 0;

    const token = localStorage.getItem('currentUser');
    const decoder = jwtDecode(token) || { user : {name: this.chance.first(), id: this.chance.bb_pin() }};
    this.name = decoder.user.name;
    this.id = decoder.user.id;
    this.color = RealtimeComponent.palette[Math.round(Math.random() * (RealtimeComponent.palette.length - 1))];
    this.roomid = 'richtext99';
    this.range = null;
    this.doc = this.connection.get('examples', this.roomid); // getting document with id 'richtext30' from 'examples' collection
    this.socket2.send(JSON.stringify({roomid: this.roomid, uid: this.id, message: 'addUser'}));
    this.modules =  {
      imageResize: {
        modules: ['Resize']
      },
      cursors: {
          hideDelayMs: 10000,
          hideSpeedMs: 5000,
          transformOnTextChange: true
      },
      table: true,
      tableUI: true,
    //   keyboard :{
    //     bindings: {
    //       backspace: {
    //         key : 8,
    //         handler(range,context) {

    //         }
    //       },
    //       delete : {
    //         key: 46,
    //         handler(range,context) {

    //         }
    //       }
    //     }
    //   }
    };
  }

  ngOnDestroy() {
    sessionStorage.clear();
    this.socket1.close();
    this.socket2.close();
    this.doc.unsubscribe((err) => {});
    this.doc.removeEventListener('on', this.update);
    this.commentbutton.removeEventListener('click', this.promptComment);
    this.fullscreenbutton.removeEventListener('click', this.fullScreen);
  }

  // deleteHandler(op: any) : boolean{
     
  //   let range = this.editor.quillEditor.getSelection();
  //   const format = this.editor.quillEditor.getFormat(range);
  //   if (format.instrack && (format.instrack.uid == this.id)) {
  //      return true;
  //   }
  //   console.log('yeeyeyeyeeyeye');
  //   let delta = new Delta();
  //   const authorFormat = {cid: this.chance.guid(), uid: this.id, name: this.name, cls: `user-${this.colorid}`};
  //   if(op === 'backspace') {
  //     if(range.length === 0) //collapsed
  //     {
  //       console.log(range);
  //       // delta = this.editor.quillEditor.formatText(range.index -1 , 1,'deltrack', authorFormat, 'user');
  //       this.editor.quillEditor.setSelection(range.index-1);
  //     } else {
  //       console.log(range.index-1, range.index.length);
  //       // delta = this.editor.quillEditor.formatText(range.index-1, range.length, 'deltrack', authorFormat, 'user');
  //       this.editor.quillEditor.setSelection(range.index-1);
  //     }
  //   } else { //delete 
  //     if(range.length === 0) //collapsed
  //     {
  //       // this.editor.quillEditor.setSelection(range.index, 1);
  //       delta = this.editor.quillEditor.formatText(range.index, 1, 'deltrack', authorFormat, 'user');
  //       this.editor.quillEditor.setSelection(range.index+1);
  //     } else {
  //       delta = this.editor.quillEditor.formatText(range.index, range.length, 'deltrack', authorFormat, 'user');
  //       this.editor.quillEditor.setSelection(range.index + range.length);
  //     }
  //   }
  //   this.doc.submitOp(delta, {source: 'quill'}); 
  //   return false;
  // }

  editorCreated($event) { // fired when editor is create

    this.editor.quillEditor.getModule('toolbar').addHandler('comment',()=>{});
    this.doc.fetch((err) => { // If the document does not exist
      if (err) {
        throw err;
      }
      if (this.doc.type === null) {
        this.doc.create([{insert: 'Document Created'}], 'rich-text');
        return;
      }
    });

    this.socket1.addEventListener('message', res => { // loading all comments
      if (JSON.parse(res.data).comments) {
        const data = JSON.parse(res.data).comments;
        for (let i = 0; i < data.length; i++) {
          const {_id, created_on, uid, name, comment, insid} = data[i];
          this.addComment(_id, created_on, uid, name, comment, insid);
        }
      }
    });

    this.updateCursor();

    this.cursorModule =  this.editor.quillEditor.getModule('cursors');

    // socket  to receive comments or cursor position

    this.socket2.addEventListener('message', data => {
      const d = JSON.parse(data.data);
      if (d.message === 'addC') { // Adding comment
        this.addComment(d.commentid, d.datetime, d.id, d.name, d.comment, d.insid);
      } else if (d.message === 'deleteC') { // Deleting comment
        this.removeComment(d.commentid);
      } else if (d.message === 'addUser') {
         if (d.uid === this.id) {
            this.colorid = d.colorid;
            console.log(this.colorid);
         }
      } else if (d.id !== this.id && d.name !== this.name) {
        if (sessionStorage.getItem(d.id)) {
          this.cursorModule.moveCursor(d.id, d.range); // if cursor already exists just update range
        } else {
          this.cursorModule.createCursor(d.id, d.name, d.color, d.range); // if cursor doesn't exist in other person's browser
        }
        sessionStorage.setItem(d.id, JSON.stringify(d)); // update cursors contents
      }
    });

    this.commentbutton = document.querySelectorAll('.ql-comment'); // comment event handler
    this.promptComment = this.promptComment.bind(this);
    for(let i=0; i< this.commentbutton.length; i++){
      this.commentbutton[i].addEventListener('click', this.promptComment);
    }
    this.fullscreenbutton = document.querySelector('.ql-fullscreen'); // full screen event handler
    this.fullScreen = this.fullScreen.bind(this);
    this.fullscreenbutton.addEventListener('click', this.fullScreen);

    document.querySelector('#saveVersion').addEventListener('click',()=>{ //Save versions
       this.ver.insertVersion(this.roomid).subscribe((val) => {
            alert('Document Saved');
       },(err) => {
           alert(`Error in saving : ${err}`);
       });
    })

    this.doc.subscribe((err) => { // Get initial value of document and subscribe to changes
        if (err) {
            throw err;
        }
        this.editor.quillEditor.setContents(this.doc.data);
        this.update = this.update.bind(this);
        this.doc.on('op', this.update);
     });

    //  this.editor.quillEditor.root.addEventListener('keydown',(event)=>{
    //       if(this.trackChanges){
    //           if(event.keyCode === 8){     // backspace in track changes mode    
    //             if(!this.deleteHandler('backspace')){
    //               event.preventDefault();
    //               return false;
    //             }
    //           }
    //           else if(event.keyCode === 46) { // delete in track changes mode
    //             if(!this.deleteHandler('delete')) {
    //               event.preventDefault();
    //               return false;
    //             }
    //           }
    //       }
    //  }, true);

     /* -dev purpose- */
    //  this.editor.quillEditor.root.addEventListener('click',(event)=>{
    //     let range = this.editor.quillEditor.getSelection();
    //     console.log(range);  
    //  })

   }

  update(op, source) {
      if (source === 'quill') {
          return;
      }
      console.log(op);
      this.editor.quillEditor.updateContents(op);
  }

  promptComment() {
    this.range = this.editor.quillEditor.getSelection();
    if (!this.range || this.range.length === 0) {
      alert('Please select a Text');
    } else {
        const prompt = window.prompt('Please Enter Comment', '');
        if (prompt !== null || prompt !== '') {
            this.comment = prompt;
            let cid = this.chance.guid();
            let delta = this.editor.quillEditor.format('comment', {uname: this.name, uid: this.id, cid, cls: 'comm'});
            this.doc.submitOp(delta, 'quill');
            this.sendComment(cid);
        }
    }
  }

  fullScreen() {
    if (document.querySelector('quill-editor').requestFullscreen) {
        if (!this.fScreen) {
          document.querySelector('quill-editor').requestFullscreen();
          this.fScreen = true;
        } else {
          this.fScreen = false;
          document.exitFullscreen();
        }
      }
  }

  logChanged($event) { // fired when text changes
    
    if($event.source !== 'user') {
      return;
    }
    // console.log($event.delta);
    // let flag=0, length=0, range = this.editor.quillEditor.getSelection();
    // const authorFormat: any = {cid: this.chance.guid(), uid: this.id, name: this.name, cls: `user-${this.colorid}`}; // bug is here how to apply Attributor class to delta   
    // if(this.trackChanges) {
    //   const ops = [];
    //   for(let i=0; i< $event.delta.ops.length; i++) {
    //     let op = $event.delta.ops[i];
    //     if(op.delete) {
    //       return;
    //     }
    //     if(op.insert) {
    //       op.attributes = op.attributes || {};
    //       if(Object.keys(op.attributes).length === 0) {
    //         flag=1;
    //       } else if(op.attributes.instrack && parseInt(op.attributes.instrack.uid,10) !==  parseInt(this.id,10)) {
    //         flag=1;
    //       }
    //       length = op.insert.length;
    //     }
    //   }
    // }
    
    this.doc.submitOp($event.delta, {source: 'quill'}); // Submit whatever was created
    
    // if(flag === 1){
    //   let offset = range.index-1;
    //   offset = offset<0 ? 0: offset;
    //   let d = this.editor.quillEditor.formatText(offset, length, 'instrack', authorFormat, 'user'); //send the formatted delta
    //   this.doc.submitOp(d, {source: 'quill'});
    // }
    // ++this.pageR;
    // if ($event.delta.ops[0].delete && this.pageR === 1) {
    //     this.editor.quillEditor.updateContents(this.doc.data);
    //     return; // prevent from delete
    // }
    
  }

  selectionUpdate($event) { // fired when selection changes
    this.range = this.editor.quillEditor.getSelection();
    if (this.range) {  
      this.popuptop = this.editor.quillEditor.getBounds(this.range.index, this.range.length).top;
      this.popupvisible = false;
      this.updateCursor();
    } else {
      this.popupvisible = true;
    }
  }

  addComment(commentid, datetime, id, name, comment, insid) { // fired when comment is added

    const d = moment.tz(datetime, 'Asia/Kolkata').format().toString();
    const d0 = document.querySelector('.comments');
    const d1 = document.createElement('div');
    d1.setAttribute('class', 'padd');
    d1.setAttribute('user-id', id);
    d1.setAttribute('insid',insid);
    const s1 = document.createElement('span');

    s1.setAttribute('class', 'resolve');
    s1.setAttribute('id', commentid);
    s1.appendChild(document.createTextNode(`Resolve`));
    d1.appendChild(s1);

    const ul = document.createElement('ul');
    const l1 = document.createElement('li');
    l1.appendChild(document.createTextNode(name)); // display name
    const l2 = document.createElement('li');
    l2.appendChild(document.createTextNode(`${d.substring(0, d.indexOf('T'))}`)); // display date
    const l3 = document.createElement('li');
    l3.appendChild(document.createTextNode(`${d.substring(d.indexOf('T') + 1, d.indexOf('+'))}`)); // display time
    const l4 = document.createElement('li');
    l4.appendChild(document.createTextNode(comment)); // display comment
    ul.appendChild(l1);
    ul.appendChild(l2);
    ul.appendChild(l3);
    ul.appendChild(document.createElement('br'));
    ul.appendChild(l4);
    d1.appendChild(ul);
    d0.appendChild(d1);

    s1.addEventListener('click', () => {
      this.deleteComment(s1.getAttribute('id'), d1.getAttribute('insid'));
    });
    // this.commentSpans.push(s1);
  }

  removeComment(id) { // fired when comment is removed
    const d0 = document.querySelector('.comments');
    const rChild = document.getElementById(id);
    d0.removeChild(rChild.parentNode);
  }

  deleteComment(cid, insid) { // sending socket event to remove comment

    /* remove span blot and extract the html here */
    let nodes = document.querySelectorAll(`[cid="${insid}"]`);
    for(let i=0; i<nodes.length; i++) { // helps removing multiline comments
      let [offset, length] = [Quill.find(nodes[i]).offset(this.editor.quillEditor.scroll), Quill.find(nodes[i]).length()];
      this.doc.submitOp(this.editor.quillEditor.removeFormat(offset,length), 'quill');
    }
    this.socket2.send(JSON.stringify({commentid: cid, roomid: this.roomid, message: 'deleteC'}));
  }

  updateCursor() { // fired when cursor position is changed
    const [name, id, color, range, roomid] = [this.name, this.id, this.color, this.range, this.roomid];
    this.socket2.send(JSON.stringify({name, id, color, range, roomid}));
  }

  sendComment(cid) { // socket event to send comment to other users
    const [name, id, roomid, comment, insid] = [this.name, this.id, this.roomid, this.comment, cid];
    this.socket2.send(JSON.stringify({name, id, roomid, comment, insid, message: 'addC'}));
  }
}


