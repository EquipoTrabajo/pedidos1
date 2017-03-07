const Product = require('../models/product');
const Office = require('../models/office');

module.exports.store = (req, res, next) => {
  Promise.all([
    Product.create(req.body), 
    Office.findById(req.user._id).exec()
  ])
    .then(rslt => {
      let product = rslt[0];
      let office = rslt[1];
      office.stockProducts.push({'product': product._id, 'stock': req.body.stock});
      if (office.type === 'office') {
        product.status = 'local';
      } else {
        product.satus = 'global';
      }
      return Promise.all([office.save(), product.save()]);
    })
    .then(rslt => res.json(rslt))
    .catch(err => res.json(err));
}

module.exports.addStock = (req, res, next) => {
  Promise.all([
    Product.findById(req.params.id).exec(),
    Office.findById(req.user._id).exec()
  ])
    .then(rslt => {
      let product = rslt[0];
      let office = rslt[1];
      product.stock = req.body.stock;
      office.stockProducts[office.stockProducts.findIndex(o => o.product === req.params.id)].stock = req.body.stock;
      return Promise.all([
        product.save(),
        office.save()
      ]);
    })
    .then(rslt => res.json(rslt))
    .catch(err => next(err));
}


module.exports.update = (req, res, next) => {
  Product.findByIdAndUpdate(req.params.id, req.body).exec()
    .then((product) => {
      return res.json(product);
    })
    .catch((err) => {
      return next(err);
    });
}

module.exports.show = (req, res, next) => {
  Product.findById(req.params.id).exec()
    .then((product) => {
      return res.json(product);
    })
    .catch((err) => {
      return next(err);
    });
}