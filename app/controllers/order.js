const Order = require('../models/order');
const Office = require('../models/office');
const Product = require('../models/product');
const Client = require('../models/client');
const Package = require('../models/package');
const officeCtrl = require('../controllers/office');
const maxDistance = 200 /6371;
const request = require('request');

const stripe = require('stripe')('sk_test_KPWOO7KXnucElF9fTEfB6dsh');





module.exports.addOrder = (req, res, next) => {
  res.render('add-order', {'user': req.user});
}

module.exports.store = (req, res, next) => {
  req.body.client = req.user._id;
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


module.exports.addProduct = (req, res, next) => {
  Promise.all([
    Product.findById(req.params.idProduct).exec(),
    Order.findById(req.params.idOrder).exec()
  ])
    .then(rslts => {
      let product = rslts[0];
      let order = rslts[1];
      if (order.products.findIndex(o => o.product === req.params.idProduct) >= 0) {
        order.products[order.products.findIndex(o => o.product === req.params.idProduct)].cant = req.body.cant;
      } else {
        order.products.push({
          'product': req.params.idProduct,
          'price': product.price,
          'cant': req.body.cant
        });
      }

      let amount = order.products.map(x => x.price * x.cant).reduce((x, y) => x+y);
      order.amount = amount;
      return order.save();
    })
    .then(rslt => res.json(rslt))
    .catch(err => next(err));
}

module.exports.showClientOrders = (req, res, next) => {
  Order.find({'office': req.params.idClient}).exec()
    .then(orders => res.json(orders))
    .catch(err => next(err));
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

module.exports.setStatusOnHold = (idOrder, idOffice) => {
  return new Promise((resolve, reject) => {
    Promise.all([
      Order.findById(idOrder).exec(),
      Office.findById(idOffice).exec()
    ])
      .then(rslts => {
        let order = rslts[0];
        let office = rslts[1];

        let cantOrders = office.wip.orders.length;
        let status = {
          name: 'En Espera',
          estimatedTime: Math.floor(office.settings.packTime * (cantOrders/office.settings.packingEmployees))
        }

        order.state.push(status);
        order.currentState = status.name;
        return order.save();
      })
      .then(rslt => resolve(rslt))
      .catch(err => reject(err));
  });
}

//esta función se usa en packageCtrl.store
module.exports.setStatusPacking = (order, office, package) => {
  
  let status = {
    name: 'Empacando',
    estimatedTime: office.settings.packTime
  }

  return new Promise((resolve, reject) => {
    let prevStateIndex = order.state.findIndex(o => o.name.toString() === 'En Espera');
    order.state[prevStateIndex].time = (Date.now() - order.state[prevStateIndex].created_at.getTime() ) / 1000;
    order.state.push(status);
    order.currentState = status.name;

    office.wip.orders.pull({'order': order._id});
    if (office.wip.packages.length <= 0 || office.wip.packages.findIndex(o => o.package.toString() === package._id.toString()) < 0) {
      office.wip.packages.push({'package': package._id});
    }
    Promise.all([
      order.save(),
      office.save()
    ])
      .then(rslts => resolve(rslts))
      .catch(err => reject(err));
  });
}

module.exports.setStatusDeliveringOnHold = (req, res, next) =>{
  Package.findById(req.params.idPackage).populate('office.id').exec()
    .then(package => {
      let idOrders = package.orders.map(x => x.order);
      return Promise.all([
        Promise.resolve(package),
        Order.find({'_id': {$in: idOrders}}).exec()
      ]);
    })
    .then(rslts => {
      let package = rslts[0];
      let orders = rslts[1];

      let saveAllOrders = [];

      let office = package.office.id;
      let status = {
        name: 'En Espera para enviar',
        estimatedTime: office.wip.packages.length / (office.settings.deliveryEmployees * office.settings.deliveryTime)
      }

      for(let order of orders){
        let prevStateIndex = order.state.findIndex(o => o.name.toString() === 'Empacando');
        order.state[prevStateIndex].time = (Date.now() - order.state[prevStateIndex].created_at.getTime() ) / 1000;
        order.state.push(status);
        order.currentState = status.name;

        saveAllOrders.push(order.save());
      }

      return Promise.all(saveAllOrders);
    })
    .then(rslts => res.json(rslts))
    .catch(err => next(err));
}

module.exports.setStatusDelivering = (req, res, next) => {
  
  Package.findById(req.params.idPackage).exec()
    .then(package => {
      
      let idOrders = package.orders.map(x => x.order);

      return Promise.all([
        Promise.resolve(package),
        Order.find({'_id': {$in: idOrders}}).exec(),
        Office.findById(package.office.id).exec()
      ]);

    })
    .then(rslts => {
      let package = rslts[0];
      let orders = rslts[1];
      let office = rslts[2];

      let saveAll = [];

      let status = {
        name: 'Enviando',
        estimatedTime: package.timeToFinish
      }

      for(let order of orders){
        let prevStateIndex = order.state.findIndex(o => o.name.toString() === 'En Espera para enviar');
        order.state[prevStateIndex].time = (Date.now() - order.state[prevStateIndex].created_at.getTime()) / 1000;
        order.state.push(status);
        order.currentState = status.name;

        saveAll.push(order.save());
      }

      office.wip.packages.pull(package._id);
      saveAll.push(office.save());

      return Promise.all(saveAll);
    })
    .then(rslt => res.json(rslt))
    .catch(err => next(err));
}


module.exports.setStatusComplete = (req, res, next) => {
  let status = {
    name: 'Completado'
  }
  Promise.all([
    Order.findById(req.params.idOrder).exec(),
    Client.findById(req.user._id).exec()
  ])
    .then(rslts => {
      let order = rslts[0];
      let client = rslts[1];

      let prevStateIndex = order.state.findIndex(o => o.name.toString() === 'En Espera para enviar');
      order.state[prevStateIndex].time = (Date.now() - order.state[prevStateIndex].created_at.getTime()) / 1000;

      order.state.push(status);
      order.currentState = status.name;

      return Promise.all([
        charge(order, client.customerID),
        order.save()
      ]);
    })
    .then(rslt => res.json(rslt))
    .catch(err => next(err));
}


module.exports.setStatusCancelled = (req, res, next) => {
  let status = {
    name: 'Cancelado'
  }
  Order.findById(req.params.id).exec()
    .then(order => {
      return Promise.all([
        Promise.resolve(order),
        Office.findById(order.office).exec(),
        Package.findOne({'order.order': order._id}).exec()
      ]);

    })
    .then(rslts => {
      let order = rslts[0];
      let office = rslts[1];
      let package = rslts[2];

      order.state.push(status);
      order.currentState = status.name;
      // calcular el cuota por cancelación

      office.wip.orders.pull({'order': order._id});
      if (package) {
        package.orders.pull({'order': order._id});
      }

      return Promise.all([
        order.save(),
        office.save(),
        package.save()
      ]);
    })
    .catch(err => next(err));
}


module.exports.getChart = (req, res, next) => {
  Order.find({'office': req.params.idOffice}).exec()
    .then(orders => {
      let dataChart = [];
      for(let order of orders) {
        for(let state of order.state){
          let indexState = dataChart.findIndex(o => o.state === state.name.toString());
          if ( indexState >= 0) {
            if (dataChart[indexState].data) {
              let indexStateDay = dataChart[indexState].data.findIndex(o => o.day === state.create_at.getDay());
              if ( indexStateDay >= 0) {
                dataChart[indexState].data[indexStateDay].orders.push({
                  'id': order._id,
                  'time': state.time
                });
              } else {
                dataChart[indexState].data.push({
                  'day': state.created_at.getDay(),
                  'orders': [{
                    'id': order._id,
                    'time': state.time
                  }]
                });
              }
            } else {
              dataChart[indexState].data = [];
              dataChart[indexState].data.push({
                'day': state.created_at.getDay(),
                'orders': [{
                  'id': order._id,
                  'time': state.time
                }]
              });
            }
          } else {
            dataChart.push({
              'state': state.name,
              'orders': [{
                'day': state.created_at.getDay(),
                'order': [{
                  'id': order._id,
                  'time': state.time
                }]
              }]
            });
          }
        }
      }

      res.json(dataChart);
    })
    .catch(err => next(err));
}

let charge = (order, customerID) => {
  return stripe.charges.create({
    currency: order.payment.currency,
    amount: order.amount,
    customer: customerID
  });
}


