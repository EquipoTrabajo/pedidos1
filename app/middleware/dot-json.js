const dot = require('dot-object');


module.exports.convert = (req, res, next) => {
  console.log('Antes: ');
  console.log(req.body);
  req.body = dot.object(req.body);
  console.log(req.body);
  next();
}