const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String
  },
  piture: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  address: {
    city: {
      type: String
    },
    state: {
      type: String
    },
    country: {
      type: String
    }
  },
  coord: {
    x: {
      type: String
    },
    y: {
      type: String
    }
  },
  created_at: {
    type: Date, 
    default: Date.now
  },
  updated_at: {
    type: Date, 
    default: Date.now
  }
}, {discriminatorKey: 'type'});



const User = module.exports = mongoose.model('User', UserSchema);