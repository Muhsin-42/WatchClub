const express = require('express')
const bcrypt          = require('bcrypt');
const app             = express()
const methodOverride = require("method-override");
const router = express.Router()
const Register = require('../models/Register')


const initializePassport = require("../authentication/userPassport");
const { session } = require('passport');

const userControl = require('../controllers/userController');


const loginCheck = ((req,res,next)=>{
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    if(req.session.admin)
        res.redirect('/admin')
    else
        next();
})

const forLogin =  ((req,res,next)=>{
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    if(req.session.loggedIn)
        res.redirect('/')
    else
        next();
}) 

const reEstablish = ((req,res,next)=>{
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    next()
})

const restrict = (async (req,res,next)=>{
    req.session.previousUrl = '/'
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    if(req.session.loggedIn){
        let userDet =     await Register.findOne({email:req.session.user.email})

        if(userDet.active == false) res.redirect('/logout')
        else    next();
    }
    else    res.redirect('/login')
})


router.get('/',loginCheck,userControl.indexView)
router.get('/login',forLogin,userControl.loginView)
router.post('/login',forLogin,userControl.loginPost)
router.get('/otp-login',forLogin,userControl.otpLoginGet)
router.post('/otp-login',forLogin,userControl.otpLoginPost)
router.post('/otp-verify',forLogin,userControl.otpVerifyPost)

router.get('/signup',forLogin,userControl.signup)
router.post('/signup',forLogin,userControl.signupPost)
router.get('/logout',userControl.logout)

//Products
router.get('/products',reEstablish,userControl.productsView)
router.get('/product-details',reEstablish,userControl.productDetails)

//MenProducts
router.get('/men-products',reEstablish,userControl.menProductsView)
router.get('/women-products',reEstablish,userControl.womenProductsView)


//Cart
router.get('/addToCart',restrict,(req,res)=>{
    console.log('hello add to cart');
})
router.patch('/change-product-quantity',restrict,userControl.changePrdtQty)
router.post('/remove-from-cart',restrict,userControl.removeFromCart)


router.post('/addToCart',restrict,userControl.addToCartPost)
router.get('/cart',restrict,reEstablish,userControl.viewCart)
router.get('/checkout',restrict,reEstablish,userControl.checkoutGet)
router.post('/checkout',restrict,userControl.checkoutPost)

// Confirm Checkout
// router.get('/confirm-checkout',userControl)
router.post('/confirm-checkout',restrict,userControl.confirmCheckoutPost)
router.post('/select-address',restrict,userControl.selectAddressCheckOut)


//order success
router.get('/order-success',restrict,reEstablish,userControl.orderSuccessView)
router.get('/orders',restrict,userControl.ordersView)
router.post('/cancel-order',restrict,userControl.cancelOrder)
router.get('/view-order-products',restrict,reEstablish,userControl.viewOrderedProduct)

//Coupons
router.post('/apply-coupon',restrict,userControl.applyCoupon)


//Profile
router.get('/my-profile',restrict,userControl.myProfileGet)
router.post('/edit-user-details',restrict,userControl.editUserPost)
router.post('/add-address-profile',restrict,userControl.addAddressProfilePost)
router.post('/edit-address',restrict,userControl.editAddressPost)
router.delete('/delete-address',restrict,userControl.deleteAddressPost)

// payment
router.post('/verify-payment',restrict,userControl.verifyRazorpayPayment)


// return
router.patch('/return-order',restrict,userControl.returnOrder)

//Invoice
router.get('/invoice',restrict,userControl.invoiceGet)


//Searching
// router.patch('/searching',userControl.searchingGet)


module.exports = {
    routes: router
}