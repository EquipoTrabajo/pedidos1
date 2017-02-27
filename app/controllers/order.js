const Order = require('../models/order');
const employeeCtrl = require('../controllers/employee');

/*const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyCh2BCQIB04NNDYyulpIio-mIPK0_ZGAzU'
});
*/

module.exports.addOrder = (req, res, next) => {
  res.render('add-order', {'user': req.user});
}

module.exports.store = (req, res, next) => {
  Order.create(req.body)
    .then((order) => {
      let employee = employeeCtrl.nearestEmployee(order.address_deliver.location);
      employeeCtrl.assignOrder(employee._id)
        .then((rslt) => {
          return res.json(order);
        });
    })
    .catch((err) => {
      return next(err);
    });
}


module.exports.update = (req, res, next) => {
  Order.findByIdAndUpdate(req.params.id, req.body).exec()
    .then((order) => {
      return res.json(order);
    })
    .catch((err) => {
      return next(err);
    });
}

module.exports.show = (req, res, next) => {
  Order.findById(req.params.id).exec()
    .then((order) => {
      return res.json(order);
    })
    .catch((err) => {
      return next(err);
    });
}

