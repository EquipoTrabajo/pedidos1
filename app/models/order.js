const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  client: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  products: {
    type: Schema.Types.ObjectId, ref: 'Product'
  },
  address_deliver: {
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
  state: {
    name: {
      type: String
    },
    review: {
      type: Number
    },
    count: {
      type: Number
    },
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