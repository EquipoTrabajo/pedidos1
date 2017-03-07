const User = require('../../models/user');
const jwt = require("jwt-simple");
const cfg = require("../../../config/config");


module.exports.authenticate = (email, password) => {
  return new Promise((resolve, reject) => {
    User.findOne({'email': email}).exec()
      .then((user) => {
        if (user) {
          user.comparePassword(password, (err, isMatch) => {
            if (err) {
              reject(err);
            }
            if (!isMatch) { resolve(null);}
            let payload = {
              id: user._id,
              name: user.name,
              email: user.email,
              type: user.type
            };
            let token = jwt.encode(payload, cfg.jwt.secret);
            resolve(token);
          });
        } else {
          resolve(null);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}