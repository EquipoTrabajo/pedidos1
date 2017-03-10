const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  client: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  office: {
    type: Schema.Types.ObjectId, ref: 'User'
  },
  officeReview: {
    flavor: {
      type: Number
    },
    preparation: {
      type: Number
    },
    delivery: {
      type: Number
    }
  },
  clientReview: {
    type: Number
  },
  products: [{
    product: {
      type: Schema.Types.ObjectId, ref: 'Product'
    },
    price: {
      type: Number
    },
    cant: {
      type: Number
    }
  }],
  amount: {
    type: Number
  },
  payment: {
    method: {
      type: String
    },
    type: {
      type: String
    },
    currency: {
      type: String
    },
    created_at: {
      type: Date,
      default: Date.now
    }
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
    estimatedTime: {
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