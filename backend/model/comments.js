const mongoose = require('mongoose');
const subcommentSchema = new mongoose.Schema({
  docid: {
    type: String,
    required: true
  },
  uid:{
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  comment:{
    type: String,
    required: true,
  },
  created_on:{
    type: Date, 
    default: new Date()
  }
}) 

const commentSchema = new mongoose.Schema({
    docid:{
        type: String,
        required: true
    },
    name: {
      type: String,
      required: true
    },
    uid:{
      type: String,
      required: true
    },
    comment:{
      type: String,
      required: true
    },
    created_on:{
      type: Date, 
      default: new Date()
    },
    sub_comments:{
      type: [subcommentSchema]
    }
  });
  
  module.exports = mongoose.model('Comments', commentSchema);