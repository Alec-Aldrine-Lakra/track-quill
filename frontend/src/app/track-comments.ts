import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;

// To preview track changes

const  Inline = Quill.import('blots/inline');

export class InsTrack extends Inline {

  static blotName = 'instrack';
  static tagName = 'ins';
  static formats(node) {
    return {
      cid: node.getAttribute('cid'),
      uid: node.getAttribute('uid'),
      name:  node.getAttribute('name'),
      title: node.getAttribute('title'),
      cls: node.getAttribute('class')
    };
  }

  static create({name, uid, cid, cls}) {
    const node = super.create();
    node.setAttribute('name', name);
    node.setAttribute('uid', uid);
    node.setAttribute('cid', cid);
    node.setAttribute('class', cls);
    node.setAttribute('title', name);
    return node;
  }
}

export class DelTrack extends Inline {

  static blotName = 'deltrack';
  static tagName = 'del';
  static formats(node) {
    return {
      cid: node.getAttribute('cid'),
      uid: node.getAttribute('uid'),
      name:  node.getAttribute('name'),
      title: node.getAttribute('title'),
      cls: node.getAttribute('class')
    };
  }

  static create({name, uid, cid, cls}) {
    const node = super.create();
    node.setAttribute('name', name);
    node.setAttribute('uid', uid);
    node.setAttribute('cid', cid);
    node.setAttribute('class', cls);
    node.setAttribute('title', name);
    return node;
  }
}


// To preview comments

export class Comment extends Inline {

  static blotName = 'comment';
  static tagName = 'ins';
  static formats(node) {
    return {
      cid: node.getAttribute('cid'),
      uname: node.getAttribute('uname'),
      uid: node.getAttribute('uid'),
      title: node.getAttribute('title'),
      cls: node.getAttribute('class')
    };
  }

  static create({uname, uid, cid, cls}) {
    const node = super.create();
    node.setAttribute('uname', uname);
    node.setAttribute('uid', uid);
    node.setAttribute('cid', cid);
    node.setAttribute('title', uname);
    node.setAttribute('class', cls);
    return node;
  }
}

