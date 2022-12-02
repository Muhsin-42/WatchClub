const Razorpay = require('razorpay')
var instance = new Razorpay({
    key_id: 'rzp_test_YVjCgdDKEYJVVG',
    key_secret: 'VZi2ME245QK5LoSn9mghKl2P',
});

const Register = require('../models/Register')
const ProductsModel = require('../models/product')
const CartModel = require('../models/cart')
const OrdersModel = require('../models/orders')
const CategoriesModel = require('../models/category')
const AddressModel = require('../models/address')
const CouponModel = require('../models/couponModel')
let dotenv = require('dotenv').config()


const cartHealper = require('../helpers/cartHelper')
const userHelper = require('../helpers/userHelpers')
const express = require('express')
const session         = require('express-session')
const bcrypt          = require('bcrypt');
const { render } = require('ejs');
const cartHealpers = require('../helpers/cartHelper')
// const client = require('twilio')('ACc54919eaa7eb2e16ef1aeafc8c43a5fe','960bbb45d2c13197ec71f2930e81f899');
const client = require('twilio')(dotenv.parsed.accountSid,dotenv.parsed.authToken);
const ObjectId = require('mongoose').Types.ObjectId
const app             = express()
const moment = require('moment')

var minm = 10000;
var maxm = 99999;
let otp = Math.floor(Math.random() * (maxm - minm + 1)) + minm;


const userControl ={
    indexView : async (req,res,next)=>{

            console.log('dotenv.parsed.key_id = ',dotenv.parsed.key_id);
        console.log('dotenv.parsed.key_secret = ',dotenv.parsed.key_secret);
        req.session.previousUrl = '/'
        res.locals.pageTitle = 'home'

        let cartCount = 0;
        const categories = await CategoriesModel.find({});
        const products = await ProductsModel.find({}).sort({_id:-1})
        
        try {
            res.render('users/index',{categories,products})
        } catch (error) {
            res.send('Error occured')
        }
    },
    loginView : (req,res,next)=>{
        res.locals.pageTitle = 'login'

        var page = '/login'
        res.render('users/login',{page})
    },
    loginPost: async (req,res,next)=>{
        const email = req.body.email;
        const pass = req.body.password;

        console.log('ssss = ',req.session.previousUrl);
        const userDetails = await Register.findOne({email: email});
        if(userDetails== null){
            res.render('users/login',{error:true,msg:'Invalid email or password'});
        }else{
            try {
                if( await bcrypt.compare(pass,userDetails.password)){
                    if(userDetails.active==false )
                    {
                        res.render('users/login',{error:true,msg:'You are Blocked'});
                    }
                    // Setting Session
                    req.session.userEmail = req.body.email;
                    req.session.loggedIn = true;
                    req.session.user = await Register.findOne({email:req.body.email})

                    if(userDetails.email=='admin@gmail.com')
                    {
                        req.session.admin = true;
                        res.redirect('admin')
                    }   
                    else
                    {
                        req.session.admin = false;
                        if(req.session.previousUrl != undefined) res.redirect(req.session.previousUrl)
                        else res.redirect('/')
                    } 
                }else{
                    res.render('users/login',{error:true,msg:'Invalid email or password'});
                }
            } catch (error) {
                
            }
        }
    },
    otpLoginGet: (req,res)=>{
        res.locals.pageTitle = 'otp login'

        res.render('users/otp-login')
    },
    otpLoginPost : async(req,res)=>{

        const userDetails = await Register.findOne({phone: req.body.phone});
        const toPhno = '+91'+req.body.phone;

        console.log('otp = '+otp);
        console.log('reg = ',userDetails);
        console.log('gave = ',toPhno);

        if(userDetails!=null)
        {
            client.messages.create({
                body: 'your otp is '+otp,
                from: '+19788506937',
                to: toPhno
            })
            .then(message => console.log(message.sid));

            res.redirect('/otp-login')
        }
        else{
            res.render('users/login',{otpError: true, msg: 'Phone Number does not exist'})
        }
        

    },
    otpVerifyPost : async (req,res)=>{

        if(otp == req.body.otp){
            req.session.userEmail = req.body.email;
            req.session.loggedIn = true;
            req.session.admin = false;
            req.session.user = await Register.findOne({email:req.body.email})

            res.redirect('/')
        }else{
            res.render('users/otp-login',{error:true,msg:'Invalid Otp'})
        }

    },
    signup : (req,res,next)=>{
        res.locals.pageTitle = 'Signup'

        res.render('users/signup')
    },
    signupPost:async(req,res,next)=>{ 
        try {
            const password = req.body.password;
            const confirmPassword = req.body.cpassword;
    
            const userDetails = await Register.find({email: req.body.email});
            const count = await Register.find({email: req.body.email}).count();
    
    
            if(count!=0)
            {
                res.render('users/signup',{error:true,msg:'Email already Exists!'})
            }
            else{
                if(password === confirmPassword){
                    const passwordHashed = await bcrypt.hash(password,10)
                    const registerEmployee = new Register({
                        name : req.body.name,
                        email: req.body.email,
                        phone: req.body.phone,
                        password: passwordHashed
                    }) 
        
                    // Setting Session
                    req.session.userEmail = req.body.email;
                    req.session.loggedIn = true;
                    req.session.admin = false;
                    req.session.user = await Register.findOne({email:req.body.email})

                    
        
                    const registered = await registerEmployee.save();

                    res.status(201).redirect('/')
                }
                else{ 
                    res.render('users/signup',{error:true,msg:'Password does not match'})
                }
            }
        } catch (error) {
            res.status(400).send(error)
        }
    },
    logout: (req,res)=>{
        req.session.destroy((err)=>{
            if(err) console.log("Error loging out : ",err)
            else res.redirect('/login')
        })
    },

    //Product
    productsView : async(req,res)=>{
        req.session.previousUrl = '/products'
        res.locals.pageTitle = 'products'

        try {
            const products = await ProductsModel.find({}).sort({_id:-1})
            res.render('users/products',{products})
        } catch (error) {
            res.redirect('/')
        }
    },
    productDetails : async(req,res)=>{
        let prdtId = req.query.id;
        req.session.previousUrl = '/product-details?id='+prdtId;
        try {
            // const userDetails = await Register.findOne({email: req.session.userEmail});
            
            // cart
            var cartExistCheck;
            let addedToCart = false;
            if (req.session.userEmail) {
                    const userDetails = await Register.findOne({email: req.session.userEmail});
                    cartExistCheck = await CartModel.findOne({userId: userDetails._id.valueOf(),active: true ,'products.item':ObjectId(prdtId)})
                    console.log('cart Exist = ',cartExistCheck);
            }
            if(cartExistCheck!=null){
                addedToCart = true;
            }

            // cart
            const product = await ProductsModel.findOne({_id: prdtId})
            // console.log(product);
            let zoom = true;
            req.locals = zoom;
            res.render('users/product-details',{product,zoom,addedToCart})
        } catch (error) {
            res.redirect('products')
        }
    },
    menProductsView : async(req,res)=>{
        req.session.previousUrl = '/men-products'
        res.locals.pageTitle = 'Men'

        try {
            const products = await ProductsModel.find({gender:'male'}).sort({_id:-1})
            const categories = await CategoriesModel.find({})

            res.render('users/men-products',{products,categories})
        } catch (error) {
            res.redirect('/')
        }
    },
    womenProductsView : async(req,res)=>{
        req.session.previousUrl = '/women-products'
        res.locals.pageTitle = 'Women'

        try {
            const categories = await CategoriesModel.find({})
            console.log('catt = ',categories);
            const products = await ProductsModel.find({gender:'female'}).sort({_id:-1})
            res.render('users/women-products',{products,categories})
        } catch (error) {
            res.redirect('/')
        }
    },


    //Cart
    viewCart: async(req,res)=>{
        req.session.previousUrl = '/cart'
        res.locals.pageTitle = 'cart'

        try {
            const userDetails = await Register.findOne({email: req.session.userEmail});
            let userId = userDetails._id.valueOf()
            // let userId = '6360a2eea72cffca128104bf'
            

            let cartItems = await CartModel.aggregate([
                {   $match: { userId: userId }  },
                {   $match: { active: true}},
                {   $unwind: '$products'        },
                {   $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {   $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {   $sort:{ _id : 1 }       }
            ])


            if(cartItems.length < 1){
                res.render('users/cart',{cartEmpty:true})
            }
            else{
                res.render('users/cart',{cartItems,userId})
            }
    
        } catch (error) {
            res.redirect('/login')
        }

                
    },
    addToCartPost:  async(req,res)=>{
            // let uId = await 
            let kwantity = parseInt(req.body.num_product);
                try {

                const userDetails = await Register.findOne({email: req.session.userEmail});


                //Update Stock
                const updateProduct = await ProductsModel.updateOne({_id: Object(req.body.pid)},{$inc : {stock: -kwantity}})


                let pid = ObjectId(req.body.pid)
                console.log('pid = ',pid);
                let prdts={
                    item : pid,
                    quantity : parseInt(req.body.num_product)
                }

                const check = await CartModel.findOne({userId: userDetails._id.valueOf(),active: true })
                if(check){
                    console.log('irukk');
                    const resu = await CartModel.updateOne({userId: userDetails._id.valueOf(),active: true}, {$push: {products: prdts}});
                    console.log('update ',resu);
                }
                else{
                    const cart = new CartModel({
                        userId : userDetails._id,
                        products: prdts,
                        dateCart:Date.now(),
                        active: true
                    }) 
            
                    const result = await cart.save();
                    console.log('add result = ',result);
                }
        
                res.redirect(`/product-details?id=${pid}`)
        } catch (error) {
            res.redirect('login')
        }
        
    },
    changePrdtQty: async(req,res)=>{
        try {
            let productId = req.body.product;
            let userId = req.body.userId;
            let count = req.body.count;
            let quantity = req.body.qty;
            console.log('quantyty = ',quantity);
            let removeProduct = false;
            if(count==-1 && quantity==1){
                console.log('deleted = ');
                const cart = await CartModel.updateOne({userId: userId,active: true},{$pull : {'products':{item: ObjectId(productId)}}})
                console.log(cart);
                res.json({quantity: parseInt(quantity)-1,removeProduct:true})
            }
            else{
                const cart = await CartModel.findOneAndUpdate({userId: userId,active: true, 'products.item': ObjectId(productId)},{$inc: {'products.$.quantity':parseInt(count)}})
                // const newCart = await CartModel.findOne({userId: userId, 'products.item': ObjectId(productId)})

                if(count==1){
                    let updateProduct = await ProductsModel.updateOne({_id: Object(req.body.pid)},{$inc : {stock: 1}})
                    res.json({quantity: parseInt(quantity)+1,removeProduct: false});
                }
                else if(count==-1){
                    updateProduct = await ProductsModel.updateOne({_id: Object(req.body.pid)},{$inc : {stock: -1}})
                    res.json({quantity: parseInt(quantity)-1,removeProduct: false})
                }
            }
            // res.status(200).send({success:true,message: 'Success',countt : 55})
        } catch (error) {
            res.status(400).send({success:false,message: error.message})
        }
    },
    removeFromCart : async(req,res)=>{
        try {
            let productId = req.body.product;
            let userId = req.body.userId;
            const cart = await CartModel.updateOne({userId: userId,active: true},{$pull : {'products':{item: ObjectId(productId)}}})
            console.log('deleted = ',cart);
            res.status(200).send({success:true,message: 'Success'})

        } catch (error) {
            res.status(400).send({success:false,message: error.message})
        }
    },

    //Checkout
    checkoutGet : async(req,res)=>{
        req.session.previousUrl = '/checkout'
        console.log('383');
        try {
            // const userDetails = await Register.findOne({email: req.session.userEmail}); //temp
            // let userId = userDetails._id.valueOf()
            let userId = req.session.user._id
            

            let cartItems = await CartModel.aggregate([
                {   $match: { userId: userId }  },
                {   $match: { active: true }  },
                {   $unwind: '$products'        },
                {   $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {   $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {   $sort:{ _id : 1 }       }
            ])

            console.log('uid = ',userId);
            let addresses = await AddressModel.find({userId: Object(userId)})
            let grandTotal = await userHelper.getTotalCartAmount(userId); 
            console.log('grand total = ',grandTotal);
            console.log('addresses d= ',addresses);

            let wallet = await userHelper.getWalletAmount()
            console.log('415 ',wallet);

            if(cartItems.length < 1){
                res.render('users/cart',{cartEmpty:true})
            }
            else{
                res.render('users/checkout2',{cartItems,userId,grandTotal,addresses})
            }
    
        } catch (error) {
            res.redirect('/login')
        }
        // res.render('users/checkout')
    },
    checkoutPost: async(req,res)=>{
        console.log('bof u = ',req.body);
        try {
            const userDetails = await Register.findOne({email: req.session.userEmail}); //temp
            let userId = userDetails._id.valueOf()
            
            let cartItems = await CartModel.aggregate([
                {   $match: { userId: userId }  },
                {   $match: { active: true }  },
                {   $unwind: '$products'        },
                {   $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {   $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                },
                {   $sort:{ _id : 1 }       }
            ])
            console.log('uid = ',userId);
            let addresses = await AddressModel.find({userId: Object(userId)})
            // let grandTotal = await userHelper.getTotalCartAmount(userId);
            let grandTotal = req.body.grandTotal;
            let coupon = req.body.coupon;
            let discount = req.body.discount;
            console.log('grand total = ',grandTotal);
            console.log('addresses = ',addresses);
            let wallet = await userHelper.getWalletAmount(req.session.user._id)
            console.log('wall = ',wallet);
            if(cartItems.length < 1){
                res.render('users/cart',{cartEmpty:true})
            }
            else{
                res.render('users/checkout2',{cartItems,userId,grandTotal,addresses,coupon,discount,wallet})
            }
        } catch (error) {
            res.status(400).send({success:false,message: error.message})
        }
    },

    //Confirm Checkout
    confirmCheckoutPost: async(req,res)=>{
        
        try {                
            console.log('38333333 = ',req.body);
            const userDetails = await Register.findOne({email: req.session.userEmail});
            let userId = userDetails._id.valueOf()
            // let userId = '6360a2eea72cffca128104bf'
            let objUserId = ObjectId(userId)
            
            //setting address
            const address = {
                userId : objUserId,
                name    :   req.body.name,
                phone   :   req.body.phone,
                fullAddress  :   req.body.address,
                country :   req.body.country,
                state   :   req.body.state,
                district: req.body.district,
                landmark: req.body.landmark,
                city: req.body.city,
                pincode :   req.body.pincode,
            }
            let timee = Date.now()
            // let grandTotal = await userHelper.getTotalCartAmount(userId)
            let grandTotal = req.body.grandTotal
            let discount = req.body.discount;
            console.log('406 = ',grandTotal);
            console.log('406 = ',discount);
            let cartItems = await userHelper.getAllCartItem(userId);
            console.log('407 = ',cartItems);

            console.log('hehehe');
            console.log('new obj ',cartItems);  

            //To save address only if newly addedd
            if(req.body.addressRadio != 'on'){
                const addressNew = new AddressModel(address);
                const res = await addressNew.save();
            }

            //To place order for each cart items


            cartItems.forEach(async element =>{
                const order = new OrdersModel({
                    userId: objUserId,
                    cartId: element._id,
                    address: address,
                    amount: grandTotal,
                    paymentMode: 'nill',
                    paymentStatus : 'not',
                    status : 'pending',
                    items : element.item,
                    product: element.products[0],
                    quantity: element.quantity,
                    discountPercentage: discount,
                    coupon: req.body.coupon,
                    date: timee
                })

                console.log('424');
                const result = await order.save();
                console.log('result',result);
            })
        
            
            //Make Cart Inactive
            cartId = cartItems[0]._id;
            console.log('cartItems Id = ',cartId);
            let updateCart = await CartModel.updateOne({_id:cartId},{'active': false} ,{upsert: true})
            console.log('538');
            console.log('updateCart ==== ',updateCart);
            
            if(req.body.paymentMethod == 'cod'){
                let codPlaced = await OrdersModel.updateOne({cartId:cartId},{$set : {'status': 'placed',paymentMode:'cod'}} ,{upsert: true})
                console.log('codPlaced = ',codPlaced);
                res.status(200).send({success:true,codSuccess:true})
            }
            else if(req.body.paymentMethod=='paypal'){
                 userHelper.generatePaypal(grandTotal).then(async (link)=>{
                    let codPlaced = await OrdersModel.update({cartId:cartId},{$set :{'status': 'placed',paymentMode:'paypal',paymentStatus:'payed'}} ,{upsert: true})
                    res.status(200).send({success:true,paypalSuccess:true,link})
                })
            }else if(req.body.paymentMethod=='razorpay'){
                userHelper.generateRazorpay(cartItems[0]._id,grandTotal).then(async (response)=>{

                    console.log('463 +',response);
                    res.status(200).send(response)
                })
            }else if(req.body.paymentMethod=='wallet'){
                console.log('wallet');
                let walletPlaced = await OrdersModel.updateOne({cartId:cartId},{$set : {'status': 'placed',paymentMode:'wallet'}} ,{upsert: true})
                console.log(570);
                let walletBalance = await userHelper.getWalletAmount(req.session.user._id)
                console.log(572);
                let remaining = parseInt(walletBalance) - grandTotal
                console.log(574);
                let result2 = await Register.updateOne({_id:req.session.user._id},{wallet:remaining},{upsert:true})
                console.log(576);

                console.log('wallet = ',walletPlaced);
                res.status(200).send({success:true,codSuccess:true})
            }
            // res.redirect('order-success')

        } catch (error) {
            res.redirect('login')
        }
    },
            //RazorPay
            verifyRazorpayPayment: (req,res)=>{

                userHelper.verifyRazorpay(req.body).then(async ()=>{
                    let status = 'placed'
                    ////////////
                    // code to change the order status
                    ///////////
                    let razorPlaced = await OrdersModel.update({cartId:cartId},{$set: {'status': 'placed',paymentMode:'razorpay',paymentStatus:'payed'}} ,{upsert: true})

                    res.status(200).send({status:true})       
                }).catch((err)=>{
                    console.log('erro = ',err);
                    res.status(400).send({status:false})
                })
            },

    selectAddressCheckOut: async(req,res)=>{
        console.log('booody = ',req.body);
        let address = await AddressModel.findOne({_id: Object(req.body.addressId)})
        console.log(address);
        res.status(200).send({success:true,address})

    },


    // Order success
    orderSuccessView: async(req,res)=>{
            res.render('users/order-success')
    },
    ordersView : async(req,res)=>{
        try {
            res.locals.moment = moment;
            const userDetails = await Register.findOne({email: req.session.userEmail});
            let userId = userDetails._id.valueOf()
            // let userId = '6360a2eea72cffca128104bf'
            let objUserId = ObjectId(userId)

            let orders = await OrdersModel.find({userId: Object(userId)}).sort({date:-1})
            // console.log('osdf  ',orders);

            let cartIds = await OrdersModel.aggregate([ { $match: { userId : ObjectId(userId) } } , 
                                                        { $group: {_id: null, orderId: {$addToSet: "$cartId"}}}, 
                                                        { $unwind: "$orderId" }, { $project: { _id: 0 }}, {$sort: {'date':-1}} ])
                console.log('631 = ',cartIds);
            let carr=[]; 
            cartIds.forEach(cart => {
                console.log('cart = ',cart.orderId);
                carr.push(cart.orderId.valueOf())
            });

            console.log('cdd = ',carr);
            // carr.reverse()


            

            res.render('users/orders',{orders,cartIds : carr})
        } catch (error) {
            res.redirect('login')
        }
    },
    cancelOrder : async(req,res)=>{
        try {
            let orderId= req.body.orderId;
            console.log(orderId);
            const result = await OrdersModel.updateOne({_id: Object(orderId)},{$set : {'status':'cancelled'  }})
            console.log('res = ',result);
            res.status(200).send({success:true,message: 'Success'})
        } catch (error) {
            res.status(400).send({success:false,message: error.message})
        }
    },
    viewOrderedProduct: async(req,res)=>{
        try {
            let orderId = req.query.id
            let orderedItems = await OrdersModel.findOne({_id:Object(orderId)})
            console.log('ord ',orderedItems.items);
            res.render('users/ordered-products', {orderedItems : orderedItems.items})
        } catch (error) {
            res.redirect('/login')
        }
    },



    //My Profile
    myProfileGet : async(req,res)=>{
        try {
            let userDetails = await userHelper.getUserDetails( req.session.userEmail);
            if(userDetails==null) throw 'user not logined'

            const addresses = await AddressModel.find({userId: userDetails._id}).sort({date:-1})
            res.render('users/my-profile',{userDetails,addresses})
        } catch (error) {
            res.redirect('login')
        }
    },
    editUserPost : async(req,res)=>{
        try {
            let userDetails = await userHelper.getUserDetails(req.session.userEmail)
            if(userDetails==null) throw 'user not loggined'
            

            let emailCount = await Register.find({$and:[{email: req.body.email}, {email: {$ne : req.session.userEmail } }]}).count()
            if(emailCount){
                var emailExist = true;
                throw 'Email already Exists!' 
            }
            
            const result = await Register.updateOne({  _id: userDetails._id },{
                name: req.body.name,
                lastname : req.body.lname,
                email: req.body.email,
                phone: req.body.phone,
                gender: req.body.gender
            } ,{upsert: true});
            console.log('resss = ',result);

            res.status(200).send({success:true,message:  'Edit Success'})
        } catch (error) {
            console.log('error = ',error);
            res.status(200).send({success:false,message: error,emailExist})
        }
    },
    addAddressProfilePost: async(req,res)=>{
        try {
            const userDetails = await userHelper.getUserDetails(req.session.userEmail)
            if(userDetails==null) throw 'user not loggined'

            const address = await new AddressModel({
                userId: userDetails._id,
                name : req.body.name,
                phone: req.body.phone ,
                country: req.body.country ,
                fullAddress: req.body.address ,
                pincode: req.body.pincode ,
                city: req.body.city,
                state: req.body.state ,
                district: req.body.district ,
                landmark: req.body.landmark,
                date: Date.now()
            }) 

            const result = await address.save();

            res.status(200).send({success:true,message:  'Edit Success'})
        } catch (error) {
            res.status(400).send({success:false,message:  'Something went wrong'})
        }
    },
    editAddressPost: async(req,res)=>{
        console.log('editing');
        try {
            const userDetails = await userHelper.getUserDetails(req.session.userEmail)
            if(userDetails==null) throw 'user not loggined'
            
            const result = await AddressModel.updateOne({  _id: Object(req.body.addressId) },{
                name : req.body.name,
                phone: req.body.phone ,
                country: req.body.country ,
                fullAddress: req.body.address ,
                pincode: req.body.pincode ,
                city: req.body.city,
                state: req.body.state ,
                district: req.body.district ,
                landmark: req.body.landmark
            } ,{upsert: true});

            res.status(200).send({success:true,message:  'Edit Success'})
        } catch (error) {
            res.status(400).send({success:false,message:  'Something went wrong'})
        }

        
    },
    deleteAddressPost: async(req,res)=>{
        try {
            const address = await AddressModel.deleteOne({_id: Object(req.body.addressId)})
            res.status(200).send({success:true,message:  'Delete Success'})
        } catch (error) {
            res.status(400).send({success:false,message:  'Something went wrong'})
        }
    },



    // Coupons
    applyCoupon : async(req,res)=>{
        try {
            console.log('bod = ',req.body);
            let couponDetails = await CouponModel.findOne({coupon:req.body.coupon})
            let checkAlreadyUsed = await CouponModel.findOne({coupon:req.body.coupon,usedBy:{$in:[req.session.user._id]}}).count()

            console.log('check alereedy sued ',checkAlreadyUsed);
            if(checkAlreadyUsed == 0){
                if(couponDetails !=null)
                {
                    let result = await CouponModel.updateOne({coupon:req.body.coupon},{$push:{usedBy: req.session.user._id}})
                    res.status(200).send({success:true,discount: couponDetails.percentage})
                }else{
                    res.status(200).send({success:false,msg: 'Invalid coupon.'})
                }
            }else{
                res.status(200).send({success:false,msg: 'Invalid coupon.'})
            }
            
        } catch (error) {
            res.status(400).send({success:false,msg: 'Something went Wrong!'})
        }
    },



    //Return
    returnOrder: async(req,res)=>{
        try {
            console.log('764 = ',req.body);
            let orderId = req.body.orderId
            let returnPrice = parseInt(req.body.returnPrice)
            let result = await OrdersModel.updateOne({_id:Object(orderId)},{status:'returned'})
            let userDetails = await Register.findOne({_id:req.session.user._id})
            console.log('userDet = ',userDetails);
            console.log('userDet = ',userDetails.wallet);
            if(userDetails.wallet!=undefined){
                let wallet= userDetails.wallet
                wallet = parseInt(wallet)+parseInt(returnPrice)
                let result2 = await Register.updateOne({_id:req.session.user._id},{wallet:wallet},{upsert:true})
            }
            else{
                let result2 = await Register.updateOne({_id:req.session.user._id},{wallet:returnPrice},{upsert:true})
            }
            res.status(200).send({success:true,msg: 'Success'})
        } catch (error) {
            res.status(400).send({success:true,msg: 'Something went wrong'})
        }
    },


    // Invoice
    invoiceGet : async(req,res)=>{
        const cartId = req.query.id
        res.locals.moment = moment;

        const order = await OrdersModel.find({cartId: Object(cartId)})



        res.render('users/invoice',{order})
    }
}


module.exports = userControl;