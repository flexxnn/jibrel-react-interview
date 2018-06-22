'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
var bodyParser = require('body-parser')

module.exports = app; // for testing

// const ItemQueue = require('./lib/ItemQueue');
// const WorkerPool = require('./lib/WorkerPool');

var config = {
  appRoot: __dirname // required config
};


SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  app.use(bodyParser.json({limit: 100 * 1024 * 1024}));
  app.use(bodyParser.raw({limit: 100 * 1024 * 1024}));  
  swaggerExpress.register(app);  

  var port = process.env.PORT || 10010;
  app.listen(port);

  // workerPool.run();

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});
