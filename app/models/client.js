const mongoose = require('mongoose');
const User = require('./user');

const Schema = mongoose.Schema;

const ClientSchema = new Schema({
  points: {
    type: Number
  },
  customerID: {
    type: String
  }
}, {discriminatorKey: 'type'});

const Client = module.exports = User.discriminator('client', ClientSchema);
