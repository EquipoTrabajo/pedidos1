const Order = require('../models/order');
const Employee = require('../models/employee');
const employeeCtrl = require('../controllers/employee');
const maxDistance = 20 /6371;
  const request = require('request');

/*const googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyCh2BCQIB04NNDYyulpIio-mIPK0_ZGAzU'
});
*/

module.exports.addOrder = (req, res, next) => {
  res.render('add-order', {'user': req.user});
}

module.exports.store = async (req, res, next) => {
  Order.create(req.body)
    .then(async (order) => {
      console.log('order emp in: ');
      try {
        let nearestEmployee = await employeeCtrl.nearestEmployee(order.address_deliver.location);
        console.log(typeof nearestEmployee);
        console.log(JSON.stringify(nearestEmployee, null, ' '));
        console.log('order emp out: ');

        let assignOrder = await employeeCtrl.assignOrder(nearestEmployee[0]._id, order._id);
        return res.json({assignOrder, order});

      } catch(e) {
        return next(e);
      }
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

