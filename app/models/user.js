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


userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

const User = module.exports = mongoose.model('User', UserSchema);