const mongoose = require('mongoose');
const User = require('../models/user');
const Client = require('../models/client');
const Office = require('../models/office');

const auth = require('./auth/authenticate');


module.exports.login = (req, res, next) => {
  auth.authenticate(req.body.email, req.body.password)
    .then((token) => {
      if (token) {
        //return res.cookie('token', token);
        return res.json({token: token});
        // return res.render('session', {'token': token});
      } else {
        return res.json({'err': 'Email y clave no coinciden'});
      }
    })
    .catch((err) => {
      // return next(err);
      return res.json(err);
    });
}


module.exports.privatetest = (req, res, next) => {
  res.json(req.user);
}