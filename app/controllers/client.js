const mongoose = require('mongoose');
const Client = require('../models/client');

const stripe = require('stripe')('sk_test_KPWOO7KXnucElF9fTEfB6dsh');


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


module.exports.saveCardToken = (req, res, next) => {

  //for testing purpose
  stripe.tokens.create({
  card: {
    "number": '4242424242424242',
      "exp_month": 12,
      "exp_year": 2018,
      "cvc": '123'
    }
  })
  .then(response => {
    console.log('response: ', JSON.stringify(response, null, ' '));
    return stripe.customers.create({
      description: 'testing',
      source: response.id
    });
  })
  .then(customer => {
    console.log('customer: ', JSON.stringify(customer, null, ' '));
    return Client.findByIdAndUpdate(req.user._id, {'customerID': customer.id}).exec();
  })
  .then(rslt => res.json(rslt))
  .catch(err => next(err));
  //end for testing purpose
  
  //uncomment when created front-end
  /*let stripeToken = req.body.stripeToken;
  stripe.customers.create({
    description: req.body.description,
    source: stripeToken
  })
  .then(customer => {
    Client.findByIdAndUpdate(req.user._id, {'customerID': customer.id}).exec();
  })
  .then(rslt => res.json(rslt))
  .catch(err => next(err));*/
}


