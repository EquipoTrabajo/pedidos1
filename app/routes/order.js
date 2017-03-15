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

router.post('/order', auth.authenticate('client'), dc.convert, orderCtrl.store);

router.post('/assign/:idOrder', officeCtrl.nearestOffices, officeCtrl.assignOrder);

router.post('/package/:idPackage/onholddelivery',  auth.authenticate('office'), orderCtrl.setStatusDeliveringOnHold);
router.post('/package/:idPackage/delivery',  auth.authenticate('office'), orderCtrl.setStatusDelivering);
router.post('/order/:idOrder/complete',  auth.authenticate('client'), orderCtrl.setStatusComplete);

router.get('/order/:idOffice/getchart', auth.authenticate('office'), orderCtrl.getChart);
router.put('/order/:idOrder/product/:idProduct/add', auth.authenticate('client'), orderCtrl.addProduct);


