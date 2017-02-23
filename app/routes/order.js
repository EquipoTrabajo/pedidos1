const orderCtrl = require('../controllers/order');

const express = require('express');
const router = express.Router();


module.exports = function (app) {
  app.use('/', router);
};

router.post('/order', orderCtrl.store);


