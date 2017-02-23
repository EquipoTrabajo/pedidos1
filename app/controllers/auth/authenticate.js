const User = require('../../models/user');
const jwt = require("jwt-simple");
const cfg = require("../../../config/config");


module.exports.authenticate = (email, password) => {
  return new Promise((resolve, reject) => {
    User.findOne({'email': email}).exec()
      .then((user) => {
        if (user) {
          let payload = {
            id: user._id
          };
          let token = jwt.encode(payload, cfg.jwt.secret);
          resolve(token);
        } else {
          resolve(null);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}