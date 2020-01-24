const WebSocket = require('ws');
const WebSocketJSONStream = require('@teamwork/websocket-json-stream');
const shareDBServer = require('./sharedb-server');
const uuid = require('uuid');
const Comment = require('../model/comments');
const Colors = require('../model/color');

var wssd = new WebSocket.Server({ // sharedb socket server
    noServer: true
});

var wssc = new WebSocket.Server({ // cursor socket server
    noServer: true
});

wssd.on('connection', function(ws1, req) {
    ws1.isAlive = true;
    console.log(`Server connected`);
    var stream = new WebSocketJSONStream(ws1);
    shareDBServer.listen(stream);
    ws1.on('pong', function(data, flags) {
        ws1.isAlive = true;
    });
    ws1.once('message', async function(data){
       let roomid = JSON.parse(data).d;
       let comments = await Comment.find({docid: roomid, resolved: false},{docid: 0, sub_comments: 0});
       ws1.send(JSON.stringify({comments}));
    })
    ws1.on('error', function(error) {
        console.log('Server Error');
    });
});

wssc.on('connection', function(ws2, req) {   
    ws2.id = uuid();
    ws2.isAlive = true;
    console.log(`Cursor connected at ${ws2.id}`);

    ws2.on('message',async function(data) {
        let d = JSON.parse(data);
        if(!ws2.roomid)
            ws2.roomid = d.roomid;
        if(d.message === 'addC'){
            let comment = new Comment({docid: d.roomid, name: d.name, uid: d.id, comment: d.comment, insid: d.insid}); // saving comments to comments collection
            try {        
                let res = await comment.save();
                d.commentid = res._id;
                d.id = res.uid;
                d.datetime = res.created_on;
                d.comment = res.comment;
                d.insid = res.insid;
            }
            catch(e){
                console.warn(`Error ${e}`);
            }   
        }
        else if(d.message === 'deleteC') {
            try{
                await Comment.updateOne({_id: d.commentid},{resolved : true});
            }
            catch(e){
                console.warn('Error ',e)
            }
        }
        else if(d.message === 'addUser') {
            try {
                let res = await Colors.findOne({ roomid: d.roomid },{_id:1, uid: 1});
                if(!res){
                    let arr = [];
                    arr.push(d.uid);
                    let color = new Colors({uid: arr, roomid: d.roomid});
                    await color.save();
                    d.colorid = 1;
                }
                else {
                    if(!res.uid.includes(d.uid)){
                        await Colors.updateOne({ _id: res.id},{ $push: { uid: d.uid }});   
                        d.colorid = res.uid.length + 1;
                    } else {   
                        d.colorid = 1+ res.uid.indexOf(d.uid); 
                    }
                }
            }
            catch(e) {
                console.warn('Error',e);
            }
        }
        wssc.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN && client.roomid === ws2.roomid){
                client.send(JSON.stringify(d));
            }
        });
    }); 
    ws2.on('close', function(code, reason) {
        console.log(`Cursor closed at ${ws2.id}`);
    });
    ws2.on('error', function(error) {
        console.log(`Cursor error at ${ws2.id}`);
    });
    ws2.on('pong', function(data) {
        ws2.isAlive = true;
    });
});

// Sockets Ping, Keep Alive

setInterval(function() {
    wssc.clients.forEach(function(ws2) {
        if (ws2.isAlive === false) return ws2.terminate();

        ws2.isAlive = false;
        ws2.ping();
    });
}, 30000);

setInterval(function() {
    wssd.clients.forEach(function(ws1) {
        if (ws1.isAlive === false) return ws1.terminate();

        ws1.isAlive = false;
        ws1.ping();
    });
}, 30000);
  
module.exports =  {wssShareDB: wssd, wssCursors: wssc};