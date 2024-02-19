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
import serverless from "serverless-http";



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

app.use('/auth', require('./modules/users/routes/auth.route') );
app.use('/roles', require('./modules/auth/routes/role.route.js') );
app.use('/payment', require('./modules/classification/routes/classification.route') );
app.use('/classifications', require('./modules/classification/routes/classification.route') );
app.use('/typeOfFactory', require('./modules/typeOfFactory/routes/typeOfFactory.route') );
app.use('/factory', require('./modules/factory/routes/factory.route') );
app.use('/itemsFactory', require('./modules/itemsFactory/routes/itemsFactory.route') );
app.use('/ourRequest', require('./modules/ourRequest/routes/ourRequest.route') );
app.use('/paymentForFactory', require('./modules/PaymentForFactories/routes/paymentForFactories.route') );
app.use('/factoryAccount', require('./modules/FactoryAccounts/routes/factoryAccount.route') );
app.use(
  "/wayOfPayment",
  require("./modules/wayOfPayment/routes/wayOfPayment.route.js")
);
app.use(
  "/stock",
  require("./modules/stock/routes/stock.route")
);
app.use(
  "/branchStock",
  require("./modules/branchStock/routes/branchStock.route")
);
app.use('/client', require('./modules/client/routes/client.route') );
app.use('/government', require('./modules/government/routes/government.route') );
app.use('/city', require('./modules/city/routes/city.route') );
app.use('/sales', require('./modules/sale/routes/sale.route') );
app.use('/paymentSale', require('./modules/paymentSale/routes/paymentSale.route') );
app.use("/profit", require("./modules/profit/routes/profit.route"));





// test afaq
app.use("/map" , require("./modules/map/routes/map.route"))

export const handler = serverless(app);
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
