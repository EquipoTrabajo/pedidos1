const passport = require("passport");  
const passportJWT = require("passport-jwt");  
const User = require("../../models/user");  
const cfg = require("../../../config/config");  
const ExtractJwt = passportJWT.ExtractJwt;  
const Strategy = passportJWT.Strategy;  
const params = {  
    secretOrKey: cfg.jwt.secret,
    jwtFromRequest: ExtractJwt.fromHeader('jwt')
};

module.exports = function() {  
  var strategy = new Strategy(params, function(payload, done) {
    User.findById(payload.id).exec()
      .then((user) => {
        if (user) {
          return done(null, user);
        } else {
          return done(new Error("User not found"), null);
        }
      })
      .catch((err) => {
        return done(err, null);
      });
  });
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });
  passport.use(strategy);
  return {
    initialize: function() {
      return passport.initialize();
    },
    authenticate: function() {
      return passport.authenticate("jwt", cfg.jwt.session);
    }
  };
};