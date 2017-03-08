const Order = require('../models/order');
const Office = require('../models/office');
const Package = require('../models/package');
const officeCtrl = require('../controllers/office');
const maxDistance = 200 /6371;
const request = require('request');




module.exports.addOrder = (req, res, next) => {
  res.render('add-order', {'user': req.user});
}

module.exports.store = (req, res, next) => {
  Order.create(req.body)
    .then((order) => {
      return res.json(order);
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


module.exports.changeStatus = (req, res, next) => {
  /*Order.findById(req.params.id).exec()
    .then(order => {
      Office.findById(req.params.idOffice).populate('wip.orders').exec()
        .then(office => {
          // let ordersLocations = office.wip.orders.map(x => x.address_deliver.location).reduce((x, y) => x + '|' + y);
          let urlRequest = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins=' + office.location[0] + ',' + office.location[1] + '&destinations=' + order.location[0] + ',' + order.location[1] + '&key=AIzaSyCwcvDpKLJLFTmE_-GaeS4e52BdzcKW5wY';
          request(urlRequest, (err, response) => {
            if (order.state.name === 'En Espera') {
              order.state.name = 'Empacando';
              if (response.body.status === 'OK') {
                if (respose.body.rows.elements.status === 'OK') {
                  office.wip.timeToFinish += response.body.rows.elements.distance.value/60;
                }
              }
              office.wip.timeToFinish += office.packTime;
            } else if (order.state.name === 'Empacando') {
              office.wip.timeToFinish -= office.packTime;
              order.state.name = 'Enviando';
            }
            return Promise.all([order.save(), office.save()]);
          });
        });
    })
    .then(rslts => {
      return res.json(rslts);
    })
    .catch(err => {
      next(err);
    });*/
}


module.exports.setStatusOnHold = (id, office) => {
  let cantOrders = office.wip.orders.length;
  let status = {
    name: 'En Espera',
    time: office.packTime * (cantOrders/office.settings.packingEmployees)
  }
  return new Promise((resolve, reject) => {
    Order.findById(id).exec()
      .then(order => {
        order.state.push(status);
        return order.save();
      })
      .then(rslt => resolve(rslt))
      .catch(err => reject(err));
  });
}

module.exports.setStatusPacking = (order, office) => {
  const orderDistance = 1 /6371;

  let newOrder = {
    'order': order._id,
    'location': order.location,
    'distance': office.wip.orders[office.wip.orders.findIndex(o => o.order === order._id)].distance,
    'duration': office.wip.orders[office.wip.orders.findIndex(o => o.order === order._id)].duration
  }

  let status = {
    name: 'Empacando',
    time: office.settings.packTime
  }

  return new Promise((resolve, reject) => {
    Promise.all([
      Order.findByIdAndUpdate(order._id, {$push: {'status': status}}).exec(),
      Office.findByIdAndUpdate(office._id, {$pullAll: {'wip.orders.order': order._id}}).exec()
    ])
      .then(rslts => resolve(rslts))
      .catch(err => reject(err));
  });
}

module.exports.setStatusDeliveringOnHold = (order, office) =>{
  let status = {
    name: 'En Espera para enviar',
    time: office.packages.package.length / (office.settings.deliveryEmployees * office.settings.deliveryTime)
  }
  return new Promise((resolve, reject) => {
    Order.findByIdAndUpdate(order._id, {$push: {'status': status}}).exec()
      .then(order => resolve(order))
      .catch(err => reject(err));
  });
}

module.exports.setStatusDelivering = (order, office, package) => {
  let status = {
    name: 'Enviando',
    time: package.timeToFinish
  }
  return new Promise((resolve, reject) => {
    Promise.all([
      Order.findByIdAndUpdate(order._id, {$push: {'status': status}}).exec(),
      Office.findByIdAndUpdate(office._id, {$pullAll: {'wip.pacakges.package': package._id}})
    ])
      .then(order => resolve(order))
      .catch(err => reject(err));
  }); 
}


module.exports.setStatusComplete = (order, office, package) => {
  let status = {
    name: 'Completado'
  }
  return new Promise((resolve, reject) => {
    Order.findByIdAndUpdate(order._id, {$push: {'status': status}}).exec()
      .then(order => resolve(order))
      .catch(err => reject(err));
  }); 
}


module.exports.setStatusCancelled = (order, office, package) => {
  let status = {
    name: 'Cancelado'
  }
  return new Promise((resolve, reject) => {
    Promise.all([
      Order.findByIdAndUpdate(order._id, {$push: {'status': status}}).exec(),
      Office.findByIdAndUpdate(office._id, {$pullAll: {'wip.orders.order': order._id}}).exec()
    ])
      .then(rslt => resolve(rslt))
      .catch(err => reject(err));
  }); 
}
