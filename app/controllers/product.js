const Product = require('../models/product');

module.exports.store = (req, res, next) => {
  Product.create(req.body)
    .then((product) => {
      return res.json(product);
    })
    .catch((err) => {
      return next(err);
    });
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