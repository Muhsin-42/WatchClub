const CartModel = require("../models/cart");

const cartHealpers = {
  getCartProduct: (userId) => {
    /*eslint-disable*/
    return new Promise(async (resolve, reject) => {
      let cartItems = await CartModel.aggregate([
        {
          $match: { userId: userId },
        },
        {
          $unwind: "$products",
        },
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
      ]);

      resolve(cartItems);
    });
  },
};

module.exports = cartHealpers;
