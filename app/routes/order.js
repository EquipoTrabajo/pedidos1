const auth = require("../controllers/auth/passport-strategy")();
const orderCtrl = require('../controllers/order');
const dc = require('../middleware/dot-json');

const express = require('express');
const router = express.Router();


module.exports = function (app) {
  app.use('/', router);
};
router.use(auth.authenticate());

router.get('/order', orderCtrl.addOrder);

router.post('/order', dc.convert, orderCtrl.store);


