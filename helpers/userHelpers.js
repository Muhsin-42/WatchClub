// let dotenv = require("dotenv").config();
require("dotenv").config();

const paypal = require("paypal-rest-sdk");
const Razorpay = require("razorpay");
/* eslint-disable */
console.log("process", process.env.client_id);
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.client_id || "",
  client_secret: process.env.client_secret || "",
});
var instance = new Razorpay({
  key_id: process.env.key_id || "",
  key_secret: process.env.key_secret || "",
});
/* eslint-enable */

const CartModel = require("../models/cart");
const Register = require("../models/Register");
const ProductsModel = require("../models/product");
const userHelper = {
  getUserDetails: async (email) => {
    const userDetails = await Register.findOne({ email: email });
    // const userDetails = await Register.findOne({email: 'sam@gmail.com'});
    return userDetails;
  },
  getUserById: async (userId) => {
    const userDetails = await Register.findOne({ _id: Object(userId) });
    return userDetails;
  },

  getProductPrice: async (productId) => {
    let product = await ProductsModel.findOne({ _id: Object(productId) });
    if (product.productOfferActive) {
      let discount = product.productOffer.offerPercentage;
      let price = product.price - (product.price / 100) * discount;
      return price;
    }
  },

  getTotalCartAmount: async (userId) => {
    // const userDetails = await Register.findOne({email: req.session.userEmail});

    let cartItems = await CartModel.aggregate([
      { $match: { userId: userId } },
      { $match: { active: true } },
      { $unwind: "$products" },
      {
        $project: {
          item: "$products.item",
          quantity: "$products.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "products",
        },
      },
      { $sort: { _id: 1 } },
    ]);

    let grandTotal = 0;
    cartItems.forEach(function (item) {
      let tqty = item.quantity;
      let tprice = item.products[0].price;
      grandTotal = tqty * tprice + grandTotal;
    });
    return grandTotal;
  },
  getAllCartItem: async (userId) => {
    let cartItems = await CartModel.aggregate([
      { $match: { userId: userId } },
      { $match: { active: true } },
      { $unwind: "$products" },
      {
        $project: {
          item: "$products.item",
          quantity: "$products.quantity",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "item",
          foreignField: "_id",
          as: "products",
        },
      },
      { $sort: { _id: 1 } },
    ]);
    return cartItems;
  },
  getCartCount: async (userId) => {
    let count = await CartModel.find({ userId: userId, active: true }).count();
    return count;
  },

  //wallet
  getWalletAmount: async (userId) => {
    let result = await Register.findOne({ _id: Object(userId) });
    if (result.wallet) {
      return result.wallet;
    } else {
      return 0;
    }
  },

  // RazorPay
  generatePaypal: (grandTotal) => {
    return new Promise((resolve) => {
      var create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: "http://localhost:3000/order-success",
          cancel_url: "http://localhost:3000/checkout",
        },
        transactions: [
          {
            item_list: {
              items: [
                {
                  name: "item",
                  sku: "item",
                  price: grandTotal,
                  currency: "USD",
                  quantity: 1,
                },
              ],
            },
            amount: {
              currency: "USD",
              total: grandTotal,
            },
            description: "This is the payment description.",
          },
        ],
      };
      paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
          throw error;
        } else {
          resolve(payment.links[1].href);
        }
      });
    });
  },

  generateRazorpay: (orderId, total) => {
    return new Promise((resolve) => {
      instance.orders.create(
        {
          amount: total * 100,
          currency: "INR",
          receipt: "" + orderId,
          notes: {
            key1: "value3",
            key2: "value2",
          },
        },
        (err, order) => {
          resolve(order);
        },
      );
    });
  },

  verifyRazorpay: (details) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      // let hmac = crypto.createHmac('sha256', 'VZi2ME245QK5LoSn9mghKl2P')
      /* eslint-disable */

      let hmac = crypto.createHmac("sha256", process.env.key_secret);
      /* eslint-enable */

      hmac.update(
        details.payment.razorpay_order_id +
          "|" +
          details.payment.razorpay_payment_id,
      );
      hmac = hmac.digest("hex");
      console.log("ddddd = ", details);
      console.log("hmac = ", hmac);
      console.log("details = ", details.payment.razorpay_signature);
      // if (hmac == details['payment[razorpay_signature]'])
      if (hmac == details.payment.razorpay_signature) {
        console.log("resolve");
        resolve();
      } else {
        console.log("reject");
        reject();
      }
    });
  },
};

module.exports = userHelper;
