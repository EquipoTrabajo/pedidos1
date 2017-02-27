const Employee = require('../models/employee');
const maxDistance = 20 /6371;
const request = require('request');

module.exports.nearestEmployee = (coords) => {
  Employee.find({'location': {$near: coords, $maxDistance: maxDistance}}).exec()
    .then((employee) => {
      console.log('Employee in: ');
      console.log(JSON.stringify(employee, null, ' '))
      console.log('Employee out: ');
      return employee;
    })
    .catch((err) => {
      console.log('Employee err: ' + err);
      return err;
    });
}


module.exports.addEmployee = (req, res, next) => {
  res.render('add-employee');
}


module.exports.store = (req, res, next) => {
  Employee.create(req.body)
    .then((employee) => {
      return res.json(employee);
    })
    .catch((err) => {
      return next(err);
    });
}

module.exports.assignOrder = (id, orderId) => {
  Employee.findById(id).exec()
    .then((employee) => {
      employee.wip.orders.push(orderId);
      return employee.save();
    })
    .catch((err) => {
      return err;
    })
}
