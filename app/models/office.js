const mongoose = require('mongoose');
const User = require('./user');

const Schema = mongoose.Schema;

const OfficeSchema = new Schema({
  cod: {
    type: String
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
    messages: [{
      order: {
        type: Schema.Types.ObjectId, ref: 'Order'
      },
      from: {
        type: Schema.Types.ObjectId, ref: 'User'
      },
      to: {
        type: Schema.Types.ObjectId, ref: 'User'
      },
      content: {
        type: String
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
  stockProducts: [{
    product: {
      type: Schema.Types.ObjectId, ref: 'Product'
    },
    stock: {
      type: Number,
      default: 1
    },
    price: {
      type: Number
    },
    currency: {
      type: Number
    }
  }],
  status: {
    type: String,
    default: 'online'
  },
  currency: {
    type: String
  },
  income: {
    dates: {
      startDate: {
        type: Date
      },
      endDate: {
        type: Date
      }
    },
    rate: {
      type: Number
    },
    commission: {
      type: Number
    },
    totalIncome: {
      type: Number
    },
    cashCollected: {
      type: Number
    },
    bankDeposit: {
      type: Number
    },
    timeLine: {
      type: Number
    },
    deliveryComplete: {
      type: Number
    },
    ordersCancelled: {
      type: Number
    }
  }
}, {discriminatorKey: 'type'});

const Office = module.exports = User.discriminator('office', OfficeSchema);
