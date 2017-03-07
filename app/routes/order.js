const auth = require("../controllers/auth/passport-strategy")();
const orderCtrl = require('../controllers/order');
const officeCtrl = require('../controllers/office');
const dc = require('../middleware/dot-json');

const express = require('express');
const router = express.Router();


module.exports = function (app) {
  app.use('/', router);
};

router.get('/order', orderCtrl.addOrder);

router.post('/order', dc.convert, orderCtrl.store);

router.post('/assign/:idOrder', officeCtrl.nearestOffices, officeCtrl.assignOrder);


