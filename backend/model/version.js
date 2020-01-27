const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
    docid:{
        type: String,
        required: true
    },
    name: {
      type: String,
      required: true
    },
    named:{
      type:Boolean,
      default: false
    },
    timestamp:{
      type: Number,
      required: true
    }
  });
  
  module.exports = mongoose.model('Version', versionSchema);