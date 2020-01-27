const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    uid:[{
      type: Number
    }],
    roomid:{
      type: String,
      required: true
    }
});
  
 
module.exports = mongoose.model('Colors', userSchema);