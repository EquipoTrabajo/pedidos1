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
  settings: {
    packTime: {
      type: Number,
      default: 1
    },
    deliveryTime: {
      type: Number,
      default: 1
    },
    employeesNumber: {
      type: Number
    },
    deliveryEmployees: {
      type: Number
    },
    packingEmployees: {
      type: Number
    }
  },
  wip: {
    orders: [{
      order: {
        type: Schema.Types.ObjectId, ref: 'Order'
      },
      distance: {
        type: Number
      },
      duration: {
        type: Number
      }
    }],
    packages: [{
      package: {
        type: Schema.Types.ObjectId, ref: 'Order'
      },
    }],
    timeToFinish: {
      type: Number
    }
  },
  status: {
    type: String
  }
}, {discriminatorKey: 'type'});

const Office = module.exports = User.discriminator('Office', OfficeSchema);
