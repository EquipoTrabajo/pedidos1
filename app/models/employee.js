const mongoose = require('mongoose');
const User = require('./user');

const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
  cod: {
    type: Number
  },
  location: {
    type: [Number],
    index: '2d'
  },
  wip: {
    orders: [{
      type: Schema.Types.ObjectId, ref: 'Order'
    }],
    timeToFinish: {
      type: Number
    }
  }
}, {discriminatorKey: 'type'});

const Employee = module.exports = User.discriminator('employee', EmployeeSchema);
