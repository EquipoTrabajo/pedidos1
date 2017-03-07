const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  name: {
    type: String
  },
  stock: {
    type: Number,
    default: 1
  },
  price: {
    type: Number
  },
  category: {
    type: String
  },
  status: {
    type: String
  }
});

const Product = module.exports = mongoose.model('Product', ProductSchema);