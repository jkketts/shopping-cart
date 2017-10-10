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

/*uristring used for connecting to mongo server. First choice is to connect to mongolab, otherwise local (used for dev)*/
var uristring = process.env.MONGOLAB_URI || 'mongodb://localhost/shopping';

/*Connect to mongoose database*/
mongoose.connect(uristring, function(err, res){
    if(err) {
        console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log('Succeeded connected to: ' + uristring);
    }
});

/*Load config file for passport, defines strategies used*/
require('./config/passport');

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layouts', extname: '.hbs'}));
app.set('view engine', '.hbs');

/*-----Express boilerplate-------*/
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator()); //Has to be done here so that data is validated as it is parsed
app.use(cookieParser());
/*-----Express boilerplate-------*/

/*Create session on visit, for 15 minutes*/
app.use(session({
    secret: 'mysupersecret', 
    resave: false, 
    saveUnitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    cookie: {maxAge: 15 * 60 * 1000}
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
