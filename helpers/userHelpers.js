let dotenv = require('dotenv').config()
const express = require('express')
const app             = express()
const paypal = require('paypal-rest-sdk');
const Razorpay = require('razorpay')

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    // 'client_id': 'Af2gr7NOtL0IV_AIUibv6CTxNr2ftLUBoYEyAXlKYR8Erj_dfnmR43BrAAJYpRjAeArA8uLNMuZyiUtm',
    // 'client_secret': 'EFszEr3OTW_g_3B4AjCjb8-lI_KMVMrpz1_-8xEUWRW2lahhbAndvmY4feU7Erdvasg9gaJxoi4SIMjR'
    'client_id': dotenv.parsed.client_id,
    'client_secret': dotenv.parsed.client_secret
});
var instance = new Razorpay({
    'key_id': dotenv.parsed.key_id,
    'key_secret': dotenv.parsed.key_secret 
});


const CartModel = require('../models/cart')
const Register = require('../models/Register')
const moment = require("moment");
const ProductsModel = require('../models/product');
const userHelper = {
    getUserDetails : async(email)=>{
        const userDetails = await Register.findOne({email: email});
        // const userDetails = await Register.findOne({email: 'sam@gmail.com'});
        return userDetails;
    },
    getUserById : async(userId)=>{
        const userDetails = await Register.findOne({_id: Object(userId)});
        return userDetails;
    },

    getProductPrice: async(productId)=>{
        let product = await ProductsModel.findOne({_id:Object(productId)})
        if(product.productOfferActive){
            let discount = product.productOffer.offerPercentage;
            let price =  (product.price) - (product.price/100)*discount
            console.log('price 35 = ',price);
            return price;
        }
    },




    getTotalCartAmount : async(userId)=>{
        // const userDetails = await Register.findOne({email: req.session.userEmail});

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

        let grandTotal = 0;
        cartItems.forEach(function(item){
            let tqty = item.quantity;
            let tprice =item.products[0].price;
            grandTotal = (tqty*tprice)+grandTotal;
        })
        console.log('userId ',userId);
        console.log('grandd = ',grandTotal);
        return grandTotal;
    },
    getAllCartItem : async(userId)=>{
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
        console.log('uId= ',userId);
        console.log('cartItems = ',cartItems);
        return cartItems;
    },
    getCartCount: async(userId)=>{
        let count = await CartModel.find({userId:userId,active:true}).count()
        return count
    },

    //wallet
    getWalletAmount : async(userId)=>{
        console.log('86');
        console.log('userId 87 = ',userId);

        let result = await Register.findOne({_id: Object(userId)})
        console.log('90 = ',result);
        if(result.wallet){
            console.log('91 = ',result.wallet);
            return result.wallet
        }else{
            return 0
        }
    },





    // RazorPay
    generatePaypal: (grandTotal)=>{
        return new Promise((resolve, reject) => {
            var create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/order-success",
                    "cancel_url": "http://localhost:3000/checkout"
                },
                "transactions": [{
                    "item_list": {
                        "items": [{
                            "name": "item",
                            "sku": "item",
                            "price": grandTotal,
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },
                    "amount": {
                        "currency": "USD",
                        "total": grandTotal
                    },
                    "description": "This is the payment description."
                }]
            };
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    console.log("Create Payment Response");
                    console.log(payment, 'payment type');
                    console.log(payment.links[1].href);
                    resolve(payment.links[1].href)
                }
            });
        })
    },
    
    generateRazorpay : (orderId, total) => {
        console.log('generateRazorpay');
        return new Promise((resolve, reject) => {
            instance.orders.create({
                amount: total*100,
                currency: "INR",
                receipt: ""+orderId,
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            }, (err, order) => {
                resolve(order)
            }) 
        })
    },
    
    verifyRazorpay : (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto')
            // let hmac = crypto.createHmac('sha256', 'VZi2ME245QK5LoSn9mghKl2P')
            let hmac = crypto.createHmac('sha256', dotenv.parsed.key_secret)
    
            hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)
            hmac = hmac.digest('hex')
            console.log('ddddd = ',details);
            console.log('hmac = ',hmac);
            console.log('details = ',details.payment.razorpay_signature);
            // if (hmac == details['payment[razorpay_signature]'])
            if (hmac == details.payment.razorpay_signature)
            {
                console.log('resolve');
                resolve()
            } else {
                console.log('reject');
                reject()
            }
    
        })
    }

}

module.exports = userHelper;
