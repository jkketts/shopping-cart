var Product = require('../models/product');

var mongoose = require('mongoose');

mongoose.connect('localhost:27017/shopping')

/*mongoose.connection.openUri('mongodb://localhost:27017/shopping', {useMongoClient: true});
*/
var products = [
    new Product({
    imagePath: "http://loremflickr.com/320/240/soap",
    title: 'Oatmeal Soap',
    desc: 'Lorem ipsum dolor et il atum le fille de choux te poux',
    price:10
    }),
    new Product({
    imagePath: "http://loremflickr.com/320/240/soap",
    title: 'Lemon Soap',
    desc: 'Lorem ipsum dolor et il atum le fille de choux te poux',
    price:8
    }),
    new Product({
    imagePath: "http://loremflickr.com/320/240/soap",
    title: 'Strawberry Soap',
    desc: 'Lorem ipsum dolor et il atum le fille de choux te poux',
    price:9
    }),
    new Product({
    imagePath: "http://loremflickr.com/320/240/soap",
    title: 'Apple Soap',
    desc: 'Lorem ipsum dolor et il atum le fille de choux te poux',
    price:12
    })
]

var done = 0;

for (var i = 0; i < products.length; i++) {
    products[i].save(function(err,result) {
        done++;
        if(done === products.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
