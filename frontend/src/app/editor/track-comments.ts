import * as QuillNamespace from 'quill';
const Quill: any = QuillNamespace;

// To preview track changes

const  Inline = Quill.import('blots/inline');

export class Track extends Inline {

  static blotName = 'track';
  static tagName = 'span';
  static formats(node) {
    return {
      cid: node.getAttribute('cid'),
      uid: node.getAttribute('uid'),
      name:  node.getAttribute('name'),
      color: node.style.backgroundColor
    };
  }

  static create({name, uid, cid, color}) {
    const node = super.create();
    node.setAttribute('name', name);
    node.setAttribute('uid', uid);
    node.setAttribute('cid', cid);
    node.style.backgroundColor = color;
    return node;
  }
}

// To preview comments

export class Comment extends Inline {

  static blotName = 'comment';
  static tagName = 'span';
  static formats(node) {
    return {
      cid: node.cid,
      name: node.getAttribute('uname'),
      uid: node.getAttribute('uid')
    };
  }

  static create({uname, uid, cid}) {
    const node = super.create();
    node.setAttribute('uname', uname);
    node.setAttribute('uid', uid);
    node.setAttribute('cid', cid);
    node.style.backgroundColor = `#fed766`;
    return node;
  }
}

