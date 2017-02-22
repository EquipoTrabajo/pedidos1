const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  client: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  address_delivered: {
    type: String
  },
  state: {
    name: {
      type: String
    },
    review: {
      type: Number
    },
    count: {
      type: Number
    }
    created_at: {
      type: Date,
      default: Date.now
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
});

const Order = module.exports = mongoose.model('Order', OrderSchema);