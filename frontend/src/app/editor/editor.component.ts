import { QuillEditorComponent } from 'ngx-quill';
import ReconnectingWebSocket from 'reconnecting-websocket';
import {ViewChild, Component, OnInit, OnDestroy } from '@angular/core';
import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;
const jwtDecode = require('jwt-decode');
import QuillCursors from 'quill-cursors';
import ImageResize from 'quill-image-resize';
import moment from 'moment-timezone';
import chance from 'chance';
const Delta = Quill.import('delta');
import {Track, Comment} from './track-comments';
Quill.register(Track);
Quill.register(Comment);

Quill.register({
  'modules/imageResize': ImageResize,
  'modules/cursors': QuillCursors
}, true);

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.less']
})

export class EditorComponent implements OnInit, OnDestroy {

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
  private trackChanges: boolean;

  // public auth: AuthService
  constructor() {
    window.onbeforeunload = () => {
      sessionStorage.clear();
    }
    this.chance = chance.Chance();
    this.sharedb = require('@teamwork/sharedb/lib/client');
    this.sharedb.types.register(require('rich-text').type);
    // Open WebSocket connection to ShareDB server
    this.socket1 = new ReconnectingWebSocket('ws://localhost:8080/sharedb');
    this.socket2 = new ReconnectingWebSocket('ws://localhost:8080/cursors');
    this.connection = new this.sharedb.Connection(this.socket1);
  }

  ngOnInit() {

    this.fScreen = false;
    this.icons = Quill.import('ui/icons');
    this.icons['author'] = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19.07 4.93l-1.41 1.41C19.1 7.79 20 9.79 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.16 6.57 6 9.03 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.66-.67-3.16-1.76-4.24l-1.41 1.41C15.55 9.9 16 10.9 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-1.86 1.28-3.41 3-3.86v2.14c-.6.35-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V2h-1C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z"/></svg>';
    this.icons['comment'] = '<svg xmlns="http://www.w3.org/2000/svg" viewbox="-21 -47 682.66669 682" ><path d="m552.011719-1.332031h-464.023438c-48.515625 0-87.988281 39.472656-87.988281 87.988281v283.972656c0 48.421875 39.300781 87.824219 87.675781 87.988282v128.871093l185.183594-128.859375h279.152344c48.515625 0 87.988281-39.472656 87.988281-88v-283.972656c0-48.515625-39.472656-87.988281-87.988281-87.988281zm-83.308594 330.011719h-297.40625v-37.5h297.40625zm0-80h-297.40625v-37.5h297.40625zm0-80h-297.40625v-37.5h297.40625zm0 0"/></svg>';
    this.icons['fullscreen'] = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M21.414 18.586l2.586-2.586v8h-8l2.586-2.586-5.172-5.172 2.828-2.828 5.172 5.172zm-13.656-8l2.828-2.828-5.172-5.172 2.586-2.586h-8v8l2.586-2.586 5.172 5.172zm10.828-8l-2.586-2.586h8v8l-2.586-2.586-5.172 5.172-2.828-2.828 5.172-5.172zm-8 13.656l-2.828-2.828-5.172 5.172-2.586-2.586v8h8l-2.586-2.586 5.172-5.172z"/></svg>';
    this.pageR = 0;

    const token = localStorage.getItem('currentUser');
    const decoder = jwtDecode(token) || { user : {name: this.chance.first(), id: this.chance.bb_pin() }};
    this.name = decoder.user.name;
    this.id = decoder.user.id;
    this.color = localStorage.getItem('color') || EditorComponent.palette[Math.round(Math.random() * (EditorComponent.palette.length - 1))];
    localStorage.setItem('color', this.color); // so that color does not change on refresh
    this.roomid = 'richtext35';
    this.range = null;

    this.doc = this.connection.get('examples', this.roomid); // getting document with id 'richtext30' from 'examples' collection
    this.modules = {
      imageResize: {
        modules: ['Resize']
      },
      cursors: {
          hideDelayMs: 10000,
          hideSpeedMs: 5000,
          transformOnTextChange: true
      }
      // toolbar: [ ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      // ['blockquote', 'code-block'],
      // [{ header: 1 }, {header: 2 }],               // custom button values
      // [{ list: 'ordered'}, { list: 'bullet' }],
      // [{ script: 'sub'}, { script: 'super' }],      // superscript/subscript
      // [{ indent: '-1'}, { indent: '+1' }],          // outdent/indent 
      // [{ size: ['small', false, 'large', 'huge'] }],  // custom dropdown
      // [{ header: [1, 2, 3, 4, 5, 6, false] }],
      // [ 'link', 'image'],
      // [{ font: [] }],
      // [{align: [] }],
      // ['fullscreen'],
      // ['comment'],
      // ['author']]
    };
  }

  // ColorLuminance(hex, lum) { // generate lighter colors
  //   hex = String(hex).replace(/[^0-9a-f]/gi, '');
  //   if (hex.length < 6) {
  //     hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  //   }
  //   lum = lum || 0;
  //   let color = '#';
  //   let c;
  //   for (let i = 0; i < 3; i++) {
  //     c = parseInt(hex.substr(i * 2, 2), 16);
  //     c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
  //     color += ('00' + c).substr(c.length);
  //   }
  //   return color;
  // }

  ngOnDestroy() {
    sessionStorage.clear();
    this.socket1.close();
    this.socket2.close();
    this.doc.unsubscribe((err) => {});
    this.doc.removeEventListener('on', this.update);
    this.commentbutton.removeEventListener('click', this.promptComment);
    this.fullscreenbutton.removeEventListener('click', this.fullScreen);
  }


  editorCreated($event) { // fired when editor is created

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
          const {_id, created_on, uid, name, comment} = data[i];
          this.addComment(_id, created_on, uid, name, comment);
        }
      }
    });

    this.updateCursor();

    this.cursorModule =  this.editor.quillEditor.getModule('cursors');

    // socket  to receive comments or cursor position

    this.socket2.addEventListener('message', data => {
      const d = JSON.parse(data.data);
      if (d.comment) {
        this.addComment(d.commentid, d.datetime, d.id, d.name, d.comment); // Adding comment
      } else if (d.message === 'delete') {
        this.removeComment(d.commentid);
      } else if (d.id !== this.id && d.name !== this.name) {
        if (sessionStorage.getItem(d.id)) {
          this.cursorModule.moveCursor(d.id, d.range); // if cursor already exists just update range
        } else {
          this.cursorModule.createCursor(d.id, d.name, d.color, d.range); // if cursor doesn't exist in other person's browser
        }
        sessionStorage.setItem(d.id, JSON.stringify(d)); // update cursors contents
      }
    });

    this.commentbutton = document.querySelector('.ql-comment'); // comment event handler
    this.promptComment = this.promptComment.bind(this);
    this.commentbutton.addEventListener('click', this.promptComment);

    this.fullscreenbutton = document.querySelector('.ql-fullscreen'); // full screen event handler
    this.fullScreen = this.fullScreen.bind(this);
    this.fullscreenbutton.addEventListener('click', this.fullScreen);


    this.authorButton = document.querySelector('.ql-author');
    this.author = this.author.bind(this);
    this.authorButton.addEventListener('click', this.author);

    this.doc.subscribe((err) => { // Get initial value of document and subscribe to changes
        if (err) {
            throw err;
        }
        this.editor.quillEditor.setContents(this.doc.data);
        this.update = this.update.bind(this);
        this.doc.on('op', this.update);
     });
   }

  update(op, source) {
      if (source === 'quill') {
          return;
      }
      this.editor.quillEditor.updateContents(op);
   }

  author() {
     this.trackChanges = !this.trackChanges;
     const range = this.editor.quillEditor.getSelection();
     if (range) {
        if (this.trackChanges) {
          this.editor.quillEditor.format('track', {name: this.name, uid: this.id, cid: this.chance.guid(), color: this.color});
        }
    }
  }

  promptComment(event) {
    this.range = this.editor.quillEditor.getSelection();
    if (!this.range || this.range.length === 0) {
      alert('Please select a Text');
      event.preventDefault();
    } else {
        const prompt = window.prompt('Please Enter Comment', '');
        if (prompt !== null || prompt !== '') {
            this.comment = prompt;
            this.editor.quillEditor.format('comment', {uname: this.name, uid: this.id, cid: this.chance.guid()});
            this.sendComment();
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
    console.log($event.delta);
    // const authorDelta: any = new Delta();
    // const authorFormat: any = { author: this.id }; // bug is here how to apply Attributor class to delta
    // $event.delta.ops.forEach((op) => {
    //     if (op.delete) {
    //       return;
    //     }
    //     if (op.insert || (op.retain && op.attributes)) {
    //       // Add authorship to insert/format
    //       op.attributes = op.attributes || {};

    //       // Bug fix for Chinese keyboards which show Pinyin first before Chinese text, and also other keyboards like Tamil
    //       if (op.attributes.author && op.attributes.author === this.id) {
    //         return;
    //       }
    //       // End bug fix
    //       op.attributes.author = this.id;
    //       // Apply authorship to our own editor
    //       authorDelta.retain(op.retain || op.insert.length || 1, authorFormat);
    //     } else {
    //       authorDelta.retain(op.retain);
    //     }
    // });

    if ($event.source !== 'user') {
        return;
    }
    // ++this.pageR;
    // if ($event.delta.ops[0].delete && this.pageR === 1) {
    //     this.editor.quillEditor.updateContents(this.doc.data);
    //     return; // prevent from delete
    // }
    this.doc.submitOp($event.delta, {source: 'quill'});
  }

  selectionUpdate($event) { // fired when selection changes
    this.range = this.editor.quillEditor.getSelection();
    if (this.range) {
      this.updateCursor();
    }
  }

  addComment(commentid, datetime, id, name, comment) { // fired when comment is added

    const d = moment.tz(datetime, 'Asia/Kolkata').format().toString();
    const d0 = document.querySelector('.comments');
    const d1 = document.createElement('div');
    d1.setAttribute('class', 'padd');
    d1.setAttribute('user-id', id);
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
      this.deleteComment(s1.getAttribute('id'));
    });
    // this.commentSpans.push(s1);
  }

  removeComment(id) { // fired when socket event comment is removed
    const d0 = document.querySelector('.comments');
    const rChild = document.getElementById(id);
    d0.removeChild(rChild.parentNode);
  }

  deleteComment(cid) { // sending socket event to remove comments
   this.socket2.send(JSON.stringify({commentid: cid, message: 'delete'}));
  }

  updateCursor() { // fired when cursor position is changed
    const [name, id, color, range, roomid] = [this.name, this.id, this.color, this.range, this.roomid];
    this.socket2.send(JSON.stringify({name, id, color, range, roomid}));
  }

  sendComment() { // socket event to send comment to other users
    const [name, id, roomid, comment] = [this.name, this.id, this.roomid, this.comment];
    this.socket2.send(JSON.stringify({name, id, roomid, comment}));
  }
}

