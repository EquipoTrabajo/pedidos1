const Product = require('../models/product');
const Office = require('../models/office');

module.exports.store = (req, res, next) => {
  Product.create(req.body)
    .then((product) => {
      return Office.findByIdAndUpdate(req.user._id, {$push: {'stockProducts': product._id}}).exec();
    })
    .then(rslt => res.json(rslt))
    .catch((err) => {
      return next(err);
    });
}

module.exports.addStock = (req, res, next) => {
  Promise.all([
    Product.findById(req.params.id).exec(),
    Office.findById(req.user.id).exec()
  ])
    .then(rslt => {
      rslt[0].stock = req.body.stock;
      rslt[1].stockProducts[rslt[1].stockProducts.findIndex(o => o.product === req.params.id)].stock = req.body.stock;
      return Promise.all([
        rslt[0].save(),
        rslt[1].save()
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