const OrdersModel = require("../models/orders");
const Register = require("../models/Register");
const ProductsModel = require("../models/product");
/*eslint-disable*/
const adminHelper = {
  //daily revenue
  dailyRevenue: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let dailyRevenue = await OrdersModel.aggregate([
          {
            $match: {
              date: { $gte: new Date(new Date() - 1000 * 60 * 60 * 24) },
            },
          },
          { $match: { status: "delivered" } },
          {
            $project: {
              price: {
                $multiply: [
                  { $toDouble: "$product.price" },
                  { $toDouble: "$quantity" },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: { $toDouble: "$price" } },
            },
          },
        ]);

        resolve(dailyRevenue[0].totalAmount);
      } catch {
        resolve(0);
      }
    });
  },

  // weekly revenue
  weeklyRevenue: () => {
    return new Promise(async (resolve, reject) => {
      // console.log(new Date(new Date()-1000*60*60*24*2));
      try {
        let weeklyRevenue = await OrdersModel.aggregate([
          {
            $match: {
              date: {
                $gte: new Date(new Date() - 1000 * 60 * 60 * 24 * 7),
              },
            },
          },
          {
            $match: {
              status: "delivered",
            },
          },
          {
            $project: {
              price: {
                $multiply: [
                  { $toDouble: "$product.price" },
                  { $toDouble: "$quantity" },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: { $toDouble: "$price" } },
            },
          },
        ]);
        resolve(weeklyRevenue[0].totalAmount);
      } catch {
        console.log("68");
        resolve(0);
      }
    });
  },

  // yearly revenue
  yearlyRevenue: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let yearlyRevenue = await OrdersModel.aggregate([
          {
            $match: {
              date: {
                $gte: new Date(new Date() - 1000 * 60 * 60 * 24 * 7 * 4 * 12),
              },
            },
          },
          {
            $match: {
              status: "delivered",
            },
          },
          {
            $project: {
              price: {
                $multiply: [
                  { $toDouble: "$product.price" },
                  { $toDouble: "$quantity" },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: { $toDouble: "$price" } },
            },
          },
        ]);

        resolve(yearlyRevenue[0].totalAmount);
      } catch {
        resolve(0);
      }
    });
  },

  // total revenue
  totalRevenue: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let totalRevenue = await OrdersModel.aggregate([
          {
            $match: {
              status: "delivered",
            },
          },
          {
            $project: {
              price: {
                $multiply: [
                  { $toDouble: "$product.price" },
                  { $toDouble: "$quantity" },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: { $toDouble: "$price" } },
            },
          },
        ]);
        console.log(totalRevenue);
        resolve(totalRevenue[0].totalAmount);
        // resolve(totalRevenue)
      } catch (error) {
        resolve(0);
      }
    });
  },

  // get chart data
  getchartData: () => {
    return new Promise((resolve, reject) => {
      OrdersModel.aggregate([
        { $match: { status: "delivered" } },
        {
          $project: {
            date: { $convert: { input: "$_id", to: "date" } },
            total: "$totalAmount",
          },
        },
        {
          $match: {
            date: {
              $lt: new Date(),
              $gt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 365),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$date" },
            total: { $sum: { $toDouble: "$amount" } },
          },
          //                     { $group: { _id: null, totalAmount: {$sum: {'$toDouble': '$amount'}} }   }
        },
        {
          $project: {
            month: "$_id",
            total: "$total",
            _id: 0,
          },
        },
      ]).then((result) => {
        OrdersModel.aggregate([
          { $match: { status: "delivered" } },
          {
            $project: {
              date: { $convert: { input: "$_id", to: "date" } },
              total: "$totalAmount",
            },
          },
          {
            $match: {
              date: {
                $lt: new Date(),
                $gt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 7),
              },
            },
          },
          {
            $group: {
              _id: { $dayOfWeek: "$date" },
              total: { $sum: { $toDouble: "$amount" } },
            },
          },
          {
            $project: {
              date: "$_id",
              total: "$amount",
              _id: 0,
            },
          },
          {
            $sort: { date: 1 },
          },
        ]).then((weeklyReport) => {
          let obj = {
            result,
            weeklyReport,
          };
          resolve(obj);
        });
      });
    });
  },

  //////////////////
  getUsersCount: async () => {
    let count = await Register.find({}).count();
    return count;
  },
  getOrdersCount: async () => {
    let count = await OrdersModel.find();
    count = count.length;
    return count;
  },
  getDeliveredOrderCount: async () => {
    let count = await OrdersModel.find({ status: "delivered" });
    count = count.length;
    return count;
  },
  getProductsCount: async () => {
    let count = await ProductsModel.find({}).count();
    return count;
  },
};

module.exports = adminHelper;
