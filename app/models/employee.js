const mongoose = require('mongoose');
const User = require('./user');

const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
  cod: {
    type: Number
  }
}, {discriminatorKey: 'type'});

const Employee = module.exports = User.discriminator('employee', EmployeeSchema);
