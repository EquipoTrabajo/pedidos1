const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  client: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  office: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  products: [{
    product: {
      type: Schema.Types.ObjectId, ref: 'Product'
    },
    cant: {
      type: Number
    }
  }],
  amount: {
    type: Number
  },
  paymentMethod: {
    type: String
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

const Order = module.exports = mongoose.model('Order', OrderSchema);