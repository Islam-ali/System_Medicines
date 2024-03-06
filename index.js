var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();
var cors = require("cors");
const { env } = require("process");
var app = express();
// import serverless from "serverless-http";
var debug = require('debug')('system-medicines:server');
var http = require('http');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

app.use(cors());

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", async (req ,res ,next)=>{
//   res.json('hello')
// });

app.use('/auth', require('./modules/users/routes/auth.route.js') );
app.use('/roles', require('./modules/auth/routes/role.route.js') );
app.use('/payment', require('./modules/classification/routes/classification.route.js') );
app.use('/classifications', require('./modules/classification/routes/classification.route.js') );
app.use('/typeOfFactory', require('./modules/typeOfFactory/routes/typeOfFactory.route.js') );
app.use('/factory', require('./modules/factory/routes/factory.route.js') );
app.use('/itemsFactory', require('./modules/itemsFactory/routes/itemsFactory.route.js') );
app.use('/ourRequest', require('./modules/ourRequest/routes/ourRequest.route.js') );
app.use('/paymentForFactory', require('./modules/PaymentForFactories/routes/paymentForFactories.route.js') );
app.use('/factoryAccount', require('./modules/FactoryAccounts/routes/factoryAccount.route.js') );
app.use("/wayOfPayment",require("./modules/wayOfPayment/routes/wayOfPayment.route.js.js"));
app.use("/stock",require("./modules/stock/routes/stock.route.js"));
app.use("/branchStock",require("./modules/branchStock/routes/branchStock.route.js"));
app.use('/client', require('./modules/client/routes/client.route.js') );
app.use('/government', require('./modules/government/routes/government.route.js') );
app.use('/city', require('./modules/city/routes/city.route.js') );
app.use('/sales', require('./modules/sale/routes/sale.route.js') );
app.use('/paymentSale', require('./modules/paymentSale/routes/paymentSale.route.js') );
app.use("/profit", require("./modules/profit/routes/profit.route.js"));
app.use("/salaries", require("./modules/Salaries/routes/salaries.route.js"));
app.use("/expences", require("./modules/expences/routes/expences.route.js"));
app.use("/dashboard", require("./modules/dashboard/routes/dashboard.route.js"));
app.use("/doctor", require("./modules/doctor/routes/doctor.route.js"));
app.use("/dr-service", require("./modules/dr-services/routes/dr-services.route.js"));






// test afaq
app.use("/map" , require("./modules/map/routes/map.route.js"))

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = err 

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

// connect DB
const url = env.DB_URL;
mongoose
  .connect(url)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

module.exports = app;
// export const handler = serverless(app);
