const dot = require('dot-object');


module.exports.convert = (req, res, next) => {
  req.body = dot.object(req.body);
  next();
}