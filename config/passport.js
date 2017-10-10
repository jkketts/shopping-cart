var passport = require('passport');
var User = require('../models/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id); //whenever you want to store the user in session, serialize it by id. use id of user
});

passport.deserializeUser(function(id,done) {
    User.findById(id, function(err, user) {
        done(err, user); // allows passport to store user in session
    });
});

//signup strategy
passport.use('local.signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done){
    /*Validation section*/
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty().isLength({min:8});
    var errors = req.validationErrors();
    /*Display if any errors are present in validation*/
    if (errors) {
        var messages = []; 
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
    }
    User.findOne({'email': email}, function(err, user) {
        if(err) {return done(err);}
        if(user){return done(null, false, {message:'Email already in use'})}//No error, but (false) not successful either
        var newUser = new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.firstName = req.body.firstName;
        newUser.lastName = req.body.lastName;
        newUser.save(function(err, result) {
            if (err) {return done(err)};
            return done(null, newUser);
        });
    });
}));

//signin strat
passport.use('local.signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, function(req, email, password, done) {
    /*Validation section*/
    req.checkBody('email', 'Invalid email').notEmpty().isEmail();
    req.checkBody('password', 'Invalid password').notEmpty();
    var errors = req.validationErrors();
    /*Display if any errors are present in validation*/
    if (errors) {
        var messages = []; 
        errors.forEach(function(error) {
            messages.push(error.msg);
        });
        return done(null, false, req.flash('error', messages));
        }
    /*Look up if user exists in database*/
    User.findOne({'email': email}, function(err, user) {
        if(err) {return done(err);}
        if(!user){return done(null, false, {message:'No user found'})}
        if(!user.validPassword(password)){
            return done(null, false, {message:'Wrong password.'
        })};
        /*If no errors, return user*/
        return done(null,user);
    });
}));