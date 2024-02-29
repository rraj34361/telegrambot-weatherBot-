const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  from: {
    type: String,
    required: true,
    default:"bot"
  },
  messageTime: {
    type: Date,
    default: Date.now
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
  },
  messageFrequency: {
    type: String,
    enum:["daily", "hourly", "twice_daily" , "everyMinute"]
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  }, 
  isBlocked: {
    type: Boolean,
    default: false
  }, 
  isDeleted: {
    type: Boolean,
    default: false
  }, 
  isRegistered :{
    type:Boolean,
    default:false
  },
  chatId : {
    type: String
  },
  weatherApiKey : {
    type: String,
  },
  telegramApiKey : {
    type: String,
  },
  chat: [chatSchema] 
});

const User = mongoose.model('User', userSchema);

module.exports = User;
