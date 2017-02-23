const clientCtrl = require('../controllers/client');

const express = require('express');
const router = express.Router();


module.exports = function (app) {
  app.use('/', router);
};

router.post('/client', clientCtrl.store);

