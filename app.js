const keyPublishable = 'pk_test_v6vwjK0426oBc7qeSreWzYlb';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHbs = require('express-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
var MongoStore = require('connect-mongo')(session);

var userRoutes = require('./routes/user');
var index = require('./routes/index');

var app = express();

mongoose.connect('localhost:27017/shopping');
require('./config/passport'); //load so this config is used

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layouts', extname: '.hbs'}));
app.set('view engine', '.hbs');

/*-----Express boilerplate-------*/
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator()); //Has to be done here so that data is validated as it is parsed
app.use(cookieParser());
/*-----Express boilerplate-------*/

app.use(session({
    secret: 'mysupersecret', 
    resave: false, 
    saveUnitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    cookie: {maxAge: 240 * 60 * 1000}
}));
app.use(flash()); //init flash
app.use(passport.initialize()); //init passport
app.use(passport.session()); //? look this up
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.locals.login = req.isAuthenticated();
    res.locals.session = req.session;
    next();
});

app.use('/user', userRoutes);
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
