const ShareDB = require('@teamwork/sharedb');
const richText = require('rich-text');
ShareDB.types.register(richText.type);
const mongodb = require('mongodb');
const db = require('@teamwork/sharedb-mongo')({mongo: function(callback) {
  mongodb.connect('mongodb://localhost:27017/test',{useUnifiedTopology: true},callback);
}});
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test',{useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true});
module.exports= new ShareDB({db, disableDocAction: true, disableSpaceDelimitedActions: true});