const productCtrl = require('../controllers/product');

const express = require('express');
const router = express.Router();


module.exports = function (app) {
  app.use('/', router);
};


router.post('/product', productCtrl.store);

router.post('/product/:id', productCtrl.update);

router.get('/product/:id', productCtrl.show);