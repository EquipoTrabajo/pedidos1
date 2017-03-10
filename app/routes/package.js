const packageCtrl = require('../controllers/package');
const auth = require("../controllers/auth/passport-strategy")();

const express = require('express');
const router = express.Router();


module.exports = function (app) {
  app.use('/', router);
};

router.post('/package/:idOrder', auth.authenticate('office'), packageCtrl.store);

