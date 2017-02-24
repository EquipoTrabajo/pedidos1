const mongoose = require('mongoose');
const Client = require('../models/client');


module.exports.store = (req, res, next) => {
  Client.create(req.body)
    .then((client) => {
      return res.json(client);
    })
    .catch((err) => {
      return next(err);
    });
}

module.exports.index = (req, res, next) => {
  res.render('profile-client', {'user': req.user});
}

module.exports.update = (req, res, next) => {
  Client.findByIdAndUpdate(req.params.id, req.body).exec()
    .then((client) => {
      return res.json(client);
    })
    .catch((err) => {
      return next(err);
    });
}

module.exports.show = (req, res, next) => {
  Client.findById(req.params.id).exec()
    .then((client) => {
      return res.json(client);
    })
    .catch((err) => {
      return next(err);
    });
}
