const clientCtrl = require('../controllers/client');
const userCtrl = require('../controllers/user');
const auth = require("../controllers/auth/passport-strategy")();

const express = require('express');
const router = express.Router();


module.exports = function (app) {
  app.use('/', router);
};

router.post('/client', clientCtrl.store);

router.post('/login', userCtrl.login);

router.post('/privatetest', auth.authenticate(), userCtrl.privatetest);

