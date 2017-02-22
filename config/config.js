var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'systemapedidos'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://127.0.0.4/systemapedidos-development'
    //db: 'mongodb://localhost/systemapedidos-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'systemapedidos'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/systemapedidos-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'systemapedidos'
    },
    port: process.env.PORT || 3000,
    db: 'mongodb://localhost/systemapedidos-production'
  }
};

module.exports = config[env];
