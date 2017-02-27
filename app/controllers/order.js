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

module.exports.store = (req, res, next) => {
  Order.create(req.body)
    .then((order) => {
      console.log('order emp in: ');
      // let employee = employeeCtrl.nearestEmployee(order.address_deliver.location);
      // console.log(typeof employee);
      // console.log(JSON.stringify(employee, null, ' '));
      // return res.json(employee);
      console.log('order emp out: ');
      /*employeeCtrl.assignOrder(employee._id)
        .then((rslt) => {
          return res.json(order);
        });*/
      return Employee.find({'location': {$near: order.address_deliver.location, $maxDistance: maxDistance}}).exec()
        .then((employee) => {
          console.log('Employee in: ');
          console.log(JSON.stringify(employee, null, ' '))
          console.log('Employee out: ');
          // return res.json(employee);
          Employee.findById(employee._id).exec()
            .then((employee) => {
              employee.wip.orders.push(order._id);
              employee.save()
                .then((emp) => {
                  return emp;
                })
                .catch((err) => {
                  return err;
                });
            })
            .catch((err) => {
              return err;
            })
          .then((rslt) => {
            return res.json(rslt);
          })
          .catch((err) => {
            return err;
          });
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

