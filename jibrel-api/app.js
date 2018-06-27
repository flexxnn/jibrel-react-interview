'use strict';

const SwaggerExpress = require('swagger-express-mw');
const express = require('express');
// const bodyParser = require('body-parser')
const http = require('http');
const messaging = require('./ws');

const conf = require('./config');

var config = {
  appRoot: __dirname // required config
};

const app = express();
const httpServer = http.createServer(app);

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  app.use('/', express.static('./static'));
  swaggerExpress.register(app);  

  // start listen
  var port = process.env.PORT || conf.server.port;
  httpServer.listen(port, '0.0.0.0');
  
  new (messaging)(httpServer);
});

module.exports = app; // for testing
