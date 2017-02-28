const mongoose = require('mongoose');
const User = require('./user');

const Schema = mongoose.Schema;

const OfficeSchema = new Schema({
  cod: {
    type: Number
  },
  location: {
    type: [Number],
    index: '2d'
  },
  packTime: {
    type: Number,
    default: 0
  },
  employeesNumber: {
    type: Number
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

const Office = module.exports = User.discriminator('office', OfficeSchema);
