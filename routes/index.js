var express = require('express');
var router = express.Router();
var Cart = require('../models/cart');
const stripe = require('stripe')(process.env.KEY_SECRET);

var Product = require('../models/product');


/* GET home page. */
router.get('/', (req, res, next) => {
  Product.find((err,docs) => {
      var productChunks=[];
      var chunkSize=3;
      var spacer = 0;
      for (var i = 0; i < docs.length; i+= chunkSize) {
          productChunks.push(docs.slice(i,i+chunkSize));
      }
      res.render('./shop/index', {products:productChunks});
  });
    
    
});

router.get('/add-to-cart/:id', (req,res,next) => {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    
    Product.findById(productId, (err,product) => {
        if (err) {
            return res.redirect('/');
        }
        cart.add(product, product.id);
        req.session.cart = cart;
        console.log(req.session.cart);
        res.redirect('/');
    });
});

router.get('/shopping-cart', (req, res, next) => {
    if(!req.session.cart) {
        return res.render('shop/shopping-cart', {products: null});
    }
    var cart = new Cart(req.session.cart);
    res.render('shop/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});

router.get('/checkout', (req,res,next) => {
    res.render('shop/checkout', {totalPrice: (req.session.cart.totalPrice)*100, totalQty: req.session.cart.totalQty});
});

router.post("/charge", (req, res, next) => {
    let amount = req.session.cart.totalPrice * 100;
    
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken
    })
    .then(customer =>
         stripe.charges.create({
            amount,
            description:"Sample Charge",
               currency:"usd",
               customer: customer.id
    }))
    .then(charge => res.render('shop/charge', {amount: req.amount}))
});

router.get('/detail/:id', (req, res, next) => {
    var productId = req.params.id;
    Product.findById(productId, (err,product) => {
        if(err) return next(err);
        return res.render('shop/detail', {product:product});
    });
});

module.exports = router;