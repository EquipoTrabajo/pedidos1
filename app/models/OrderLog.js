const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderLogSchema = new Schema({
  client: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  Office: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  products: [{
    type: Schema.Types.ObjectId, ref: 'Product'
  }],
  address_deliver: {
    name: {
      type: String
    },
    location: {
      type: [Number],
      index: '2d'
    }
  },
  state: [{
    name: {
      type: String,
      default: 'En Espera'
    },
    review: {
      type: Number
    },
    time: {
      type: Number
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  }],
  currentState: {
    type: String,
    default: 'En Espera'
  },
  timeToFinish: {
    type: Number
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

const OrderLog = module.exports = mongoose.model('OrderLog', OrderLogSchema);