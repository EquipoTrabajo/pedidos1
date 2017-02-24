const mongoose = require('mongoose');
const User = require('../models/user');
const Client = require('../models/client');
const Employee = require('../models/employee');

const auth = require('./auth/authenticate');


module.exports.login = (req, res, next) => {
  auth.authenticate(req.body.email, req.body.password)
    .then((token) => {
      //return res.cookie('token', token);
      // return res.json({token: token});
      return res.render('session', {'token': token});
    })
    .catch((err) => {
      return next(err);
    });
}


module.exports.privatetest = (req, res, next) => {
  res.json(req.user);
}