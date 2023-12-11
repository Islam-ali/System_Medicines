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
app.use('/typeOfFactory', require('./modules/typeOfFactory/routes/typeOfFactory.route') );
app.use('/factory', require('./modules/factory/routes/factory.route') );

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
const url = env.DATABASE_URL;
mongoose
  .connect(url)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

module.exports = app;
