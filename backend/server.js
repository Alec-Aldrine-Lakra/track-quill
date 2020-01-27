var http = require('http');
var express = require('express');
const url = require('url');
var app = express();
var cors = require('cors');
const bodyparser = require('body-parser');
app.use(cors());
app.use(bodyparser.json());
var server = http.createServer(app);
const {wssCursors, wssShareDB} =  require('./helpers/sockets'); 
const Version = require('./model/version');

const db = require('./helpers/sharedb-server');

server.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;
  if (pathname === '/sharedb') {
      wssShareDB.handleUpgrade(request, socket, head,(ws) => {
        wssShareDB.emit('connection', ws);
      });
    } else if (pathname === '/cursors') {
      wssCursors.handleUpgrade(request, socket, head, (ws) => {
        wssCursors.emit('connection', ws);
      });
    } 
     else {
      socket.destroy();
    }
});

app.get('/versions/:id', async (req,res)=>{
    let id = req.params.id;
    try {
      let ver = await Version.find({docid: id}); 
      res.send({versions: ver});
    } catch(err) {
      res.send({'Error': err});
    }
    
})

app.post('/versions', async (req,res)=>{
  let {id, name, docid} = req.body;
  console.log(req.body);
  if(!name && !id){
    let ver = new Version({docid, timestamp: new Date().getTime(), name: new Date().getTime()});
    try {
      let s = await ver.save();
      res.send({saved: s});
    } catch (err) {
      res.send({'Error': err});
    }
    
  } else {
    try {
      let s = await Version.updateOne({_id: id},{name: name, named: true});
      res.send({updated: s});
    } catch (err) {
      res.send({'Error': err});
    }
  } 
})



let port = 8080;
server.listen(port);
console.log(`Listening on http://localhost: ${port}`);
