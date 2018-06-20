'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
module.exports = app; // for testing

// const ItemQueue = require('./lib/ItemQueue');
// const WorkerPool = require('./lib/WorkerPool');

var config = {
  appRoot: __dirname // required config
};


SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // swaggerExpress.runner.restQueue = restQueue;

  // install middleware
  swaggerExpress.register(app);  

  // console.log(swaggerExpress);

  var port = process.env.PORT || 10010;
  app.listen(port);

  // workerPool.run();

  if (swaggerExpress.runner.swagger.paths['/hello']) {
    console.log('try this:\ncurl http://127.0.0.1:' + port + '/hello?name=Scott');
  }
});
