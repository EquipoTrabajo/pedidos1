const  mongoose = require('mongoose');

const express = require('express');
const router = express.Router();


module.exports = function (app) {
  app.use('/', router);
};

router.get('/', function (req, res, next) {
  if(req.user) {
    res.render('index', {'user': user});
  } else {
    res.render('index');
  }
});

router.get('/register', function (req, res, next) {
  res.render('register');
});

router.get('/map', (req, res, next) => {
  res.render('map');
});
