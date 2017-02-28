const clientCtrl = require('../controllers/client');
const officeCtrl = require('../controllers/office');
const userCtrl = require('../controllers/user');
const auth = require("../controllers/auth/passport-strategy")();

const dc = require('../middleware/dot-json');


const express = require('express');
const router = express.Router();


module.exports = function (app) {
  app.use('/', router);
};

router.post('/client', clientCtrl.store);


router.get('/office', officeCtrl.addOffice);
router.post('/office', dc.convert, officeCtrl.store);

router.post('/login', userCtrl.login);

router.use(auth.authenticate());

// router.get('/privatetest', userCtrl.privatetest);

router.get('/profile', clientCtrl.index);

router.get('/index', officeCtrl.index);

