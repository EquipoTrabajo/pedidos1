const mongoose = require('mongoose');
const User = require('./user');

const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
  cod: {
    type: Number
  },
  location: {
    lat: {
      type: Number
    },
    lng: {
      type: Number
    },
    zoom: {
      type: Number
    }
  },
  orders: [{
    type: Schema.Types.ObjectId, ref: 'Order'
  }]
}, {discriminatorKey: 'type'});

const Employee = module.exports = User.discriminator('employee', EmployeeSchema);
