const Employee = require('../models/employee');
const maxDistance = 20 /6371;
const request = require('request');

module.exports.nearestEmployee = (coords) => {
  return new Promise((resolve, reject) => {
    Employee.find({'location': {$near: coords, $maxDistance: maxDistance}}).exec()
      .then((employee) => {
        console.log('Employee in: ');
        console.log(JSON.stringify(employee, null, ' '))
        console.log('Employee out: ');
        // return employee;
        resolve(employee);
      })
      .catch((err) => {
        console.log('Employee err: ' + err);
        // return err;
        reject(err);
      });
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
  return new Promise((resolve, reject) => {
    Employee.findById(id).populate('wip.orders').exec()
      .then((employee) => {
        console.log(JSON.stringify(employee, null, ' '));
        employee.wip.orders.push(orderId);


        if (employee.wip.orders.length > 0) {
          let ordersLocations = employee.wip.orders.map(x => x.address_deliver.location).reduce((x, y) => x + '|' + y);
          let urlRequest = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + employee.location[0] + ',' + employee.location[1] + '&destinations=' + ordersLocations + '&key=AIzaSyCwcvDpKLJLFTmE_-GaeS4e52BdzcKW5wY';
          console.log(urlRequest);
        }
        // request('https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=40.6655101,-73.89188969999998&destinations=40.6860072%2C-73.6334271|40.598566%2C-73.7527626&key=AIzaSyCwcvDpKLJLFTmE_-GaeS4e52BdzcKW5wY')
        return employee.save();
      })
      .then(rslt => resolve(rslt))
      .catch((err) => {
        reject(err);
      });
  }); 
}
