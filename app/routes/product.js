const productCtrl = require('../controllers/product');
const auth = require("../controllers/auth/passport-strategy")();

const express = require('express');
const router = express.Router();


module.exports = function (app) {
  app.use('/', router);
};


router.post('/product', auth.authenticate('office'), productCtrl.store);

router.put('/product/:id', auth.authenticate('office'), productCtrl.update);

router.get('/product/:id', productCtrl.show);