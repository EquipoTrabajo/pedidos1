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
    name: {
      type: String
    },
    location: {
      type: [Number],
      index: '2d'
    }
  },
  state: {
    name: {
      type: String,
      default: 'En Espera',
      enum: ['En Espera', 'Empacando', 'Enviando']
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