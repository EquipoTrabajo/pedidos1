const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const PackageSchema = new Schema({
  office: {
    id: {
      type: Schema.Types.ObjectId, ref: 'User'
    },
    location: {
      type: [Number],
      index: '2d'
    }
  },
  orders:[{ 
    order: {
      type: Schema.Types.ObjectId, ref: 'Order'
    },
    location: {
      type: [Number],
      index: '2d'
    },
    distance: {
      type: Number
    },
    duration: {
      type: Number
    }
  }],
  complete: {
    type: Boolean,
    default: false
  },
  distance: {
    type: Number
  },
  duration: {
    type: Number
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

const Package = module.exports = mongoose.model('Package', PackageSchema);