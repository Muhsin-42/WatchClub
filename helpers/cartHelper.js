const CartModel = require('../models/cart')
const Cart = require('../models/cart')
const ObjectId = require('mongoose').Types.ObjectId


const cartHealpers = {
    // addPorductToCart : (userId, proId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let productObj = {
    //             item:  ObjectId(proId),
    //             quantity: 1
    //         }
    //         let userCart = await Cart.findOne({ user: ObjectId(userId) })
    //         if (userCart) {
    //             let productExist = userCart.products.findIndex(product => product.item == proId)
    //             if (productExist != -1) {
    //                 await Cart.updateOne({ 'products.item': ObjectId(proId) }, {
    //                     $inc: {'products.$.quantity': 1}
    //                  })
    //                 resolve()
    //             } else { await Cart.updateOne({ user: ObjectId(userId) }, {
    //                     $push: {
    //                         products: productObj
    //                     }
    //               })
    //                 resolve()
    //             }
                
                
    //         } else {
                
    //             let cart = new Cart
    //                 cart.user = Object(ObjectId(userId)),
    //                 cart.products.push(productObj)
    //                 await cart.save()
    //             resolve()
    //          }
    //     })
    // },
    
    getCartProduct : (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await CartModel.aggregate([
                {
                    $match: { userId: userId }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'products'
                    }
                }
                
            ])

            resolve(cartItems)
        })
         
    }
    
    //  getCartCount : (userId) => {
    //     let count = 0
    //     return new Promise(async(resolve, reject) => {
    //         let cart = await Cart.findOne({ user: ObjectId(userId) })
    //         if (cart) {
    //             count = cart.products.length
    //         }
    //         resolve(count)
    //     })
    // }
}



module.exports = cartHealpers;