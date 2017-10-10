var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var passport = require('passport');

var Product = require('../models/product');
var userHandlers = require('../controllers/userController');

var csrfProtection = csrf();
router.use(csrfProtection);

    

/**** Check if user is logged in or out and redirect ****/

router.get('/profile', isLoggedIn, function(req,res,next) {
    res.render('../views/user/profile');
});

router.get('/logout', function(req, res, next) {
    req.logout();
    res.redirect('/');
});

router.use('/', notLoggedIn, function(req, res,next) {
    next();
});

/**** User Log in and Log out ****/

router.get('/signin', function(req,res,next){
    var messages = req.flash('error');
    res.render('../views/user/signin', {csrfToken:req.csrfToken(), messages: messages, hasErrors: messages.length > 0});

})

router.post('/signin', passport.authenticate('local.signin', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signin',
    failureFlash: true
}));

/**** User sign up ****/

router.get('/signup', function(req, res, next) {
    var messages = req.flash('error');
    res.render('../views/user/signup', {csrfToken:req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signup', passport.authenticate('local.signup', {
    successRedirect: '/user/profile',
    failureRedirect: '/user/signup',
    failureFlash: true
}));

/**** User forgot password ****/

router.get('/forgot', function(req,res,next){
    res.render('../views/user/forgot', {csrfToken:req.csrfToken()});
});

router.post('/forgot', function(req, res, next){
    userHandlers.forgot_password(req, res);
    res.redirect('/');
});

router.get('/reset', function(req,res,next) {
    res.render('../views/user/reset', {csrfToken:req.csrfToken()});
})

router.post('/reset', function(req,res,next) {
    userHandlers.reset_password(req, res);
    res.redirect('/');
})

module.exports = router;

function isLoggedIn(req,res,next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}

function notLoggedIn(req,res,next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}