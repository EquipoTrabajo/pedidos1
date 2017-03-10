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

module.exports.sendMessage = (req, res, next) => {
  Office.findById(req.params.idOffice).exec()
    .then(office => {
      office.wip.messages.push({
        'order': req.params.idOrder,
        'from': req.user._id,
        'to': office._id,
        'content': req.body.text
      });
      return office.save();
    })
    .then(rslt => res.json(rslt))
    .catch(err => next(err));
}


module.exports.getMessages = (req, res, next) => {
  Office.findById(req.params.id).exec()
    .then(office => {
      let messages = office.wip.messages.filter(x => x.to === req.user._id);
      res.json(messages);
    })
    .catch(err => next(err));
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
