var createError = require('http-errors');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var post_page = require('./routes/post_page');
var result_page = require('./routes/result_page');
var storage_page = require('./routes/storage');
var pdf_page = require('./routes/pdf_page');
var connect_page = require('./routes/connect_page');

var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use(function(req, res, next ){
   res.header("Access-Control-Allow-Origin","*");
   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
   res.header('Access-Control-Allow-Methods', 'GET, POST');
   next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.engine('html', require('ejs').renderFile());
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/result_page', result_page);
app.use('/post_page', post_page);
app.use('/users', usersRouter);
app.use('/storage', storage_page);
app.use('/connect_page', connect_page);
app.use(express.static(path.join(__dirname,'routes')));
app.use(express.static(path.join(__dirname,'views')));
app.use(express.static(path.join(__dirname,'node_modules')));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
