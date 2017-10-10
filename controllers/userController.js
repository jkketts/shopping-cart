var path = require('path');
var nodemailer = require('nodemailer');
var _ = require('lodash');
var async = require('async');
var User = require('../models/user');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');

/*Configure email to use hbs templating*/
const hbs = require('nodemailer-express-handlebars'),
      email = process.env.MAILER_EMAIL_ID || 'justin@ketterman.tv',
      pass = process.env.MAILER_PASSWORD || 'farion'
      nodemailer = require('nodemailer');

/*Use SMTP protocol to send email*/
const   smtpTransport = nodemailer.createTransport({
        service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
        auth: {
            user: email,
            pass: pass
        }
});

/*HBS templating options*/
const   handlebarsOptions = {
        viewEngine: 'handlebars',
        viewPath: 'views/email',
        extName: '.html'
};

smtpTransport.use('compile', hbs(handlebarsOptions));

/*Create email sent to user with link to reset token*/
exports.forgot_password = function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({
                email: req.body.email
            }).exec(function(err,user) {
                if (user) {
                    done(err,user);
                } else {
                    done('User not found.');
                }
            });
        },
        function(user, done) {
            //create the random token
            crypto.randomBytes(20, function(err, buffer) {
                var token = buffer.toString('hex');
                done(err,user,token);
            });
        },
        function(user, token, done) {
            User.findByIdAndUpdate({ _id: user._id}, {reset_password_token: token, reset_password_expires: Date.now() + 86400000}, {upsert: true, new:true}).exec(function(err, new_user) {
                done(err, token, new_user);
            });
        },
        function(token, user, done) {
            var data = {
                to: user.email,
                from: email,
                template: 'forgot-password-email',
                subject: 'Password help has arrived!',
                context: {
                    url: 'http://localhost:3000/user/reset?token=' + token,
                    name: user.firstName
                }
            };
            
            smtpTransport.sendMail(data, function(err) {
                if (!err) {
                    return res.json({ message: 'Please check your email for further instructions'});
                } else {
                    return done(err);
                }
            });
        }
    ], function(err) {
        return res.status(422).json({ message: err });
    });
};

/*Email to send verification that email was reset/not reset*/
exports.reset_password = function(req, res, next) {
    User.findOne({
        reset_password_token: req.body.token,
        reset_password_expires: {
            $gt: Date.now()
        }
    }).exec(function(err,user) {
        if(!err && user) {
            if(req.body.newPassword === req.body.confirmPassword) {
                user.password = bcrypt.hashSync(req.body.newPassword, bcrypt.genSaltSync(5), null);
                user.reset_password_token = undefined;
                user.reset_password_expires = undefined;
                user.save(function(err) {
                    if(err) {
                        return res.status(422).send({
                            message: err
                        });
                    } else {
                        var data = {
                            to: user.email,
                            from: email,
                            template: 'reset-password-email',
                            subject: 'Password Reset Confirmation',
                            context: {
                                name: user.firstName
                            }
                        };
                        
                        smtpTransport.sendMail(data, function(err) {
                            if(!err) {
                                return res.json({message: 'Password reset'});
                            } else {
                                return done(err);
                            }
                        });
                    }
                });
                    } else {
                        return res.status(422).send({
                            message: 'Passwords do not match'
                        });
                    }
                    } else {
                          return res.status(400).send ({
                    message: 'Password reset token is not valid or has expired.'
                      });
                    }
    });
};