const Order = require('../models/order');
const Office = require('../models/office');
const Product = require('../models/product');
const Package = require('../models/package');
const officeCtrl = require('../controllers/office');
const maxDistance = 200 /6371;
const request = require('request');




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
      console.log('amount: ', amount);
      order.amount = amount;
      return order.save();
    })
    .then(rslt => res.json(rslt))
    .catch(err => next(err));
}

/*module.exports.order = (req, res, next) => {
  Order.findById(req.params.idOrder).exec()
    .then(order => {
      order.payment.method = req.body.paymentMethod;
      order.payment.type = req.body.paymentType;
      order.payment.currency = req.body.currency;

      return Promise.all([
        order.save(),
        statusOnhold(order._id, order.office)
      ]);
    })
    .then(rslts => res.json(rslts))
    .catch(err => nex(err));
}
*/
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

module.exports.setStatusPacking = (order, office) => {
  
  let status = {
    name: 'Empacando',
    estimatedTime: office.settings.packTime
  }

  return new Promise((resolve, reject) => {
    order.state.push(status);
    order.currentState = status.name;

    office.wip.orders.pull({'order': order._id});
    Promise.all([
      order.save(),
      office.save()
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
