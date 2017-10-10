var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var user = new Schema({
    firstName: {type:String, required:true},
    lastName: {type:String, required:true},
    email: {type:String, required:true},
    password: {type:String, required:true},
    reset_password_token: {type: String},
    reset_password_expires: {type: Date}
});

user.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

user.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);//this.password refers to password above under varuser=newschema
};

module.exports = mongoose.model('User', user);