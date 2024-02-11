const ObjectId = require("mongoose").Types.ObjectId;
const AdminsModel = require("../models/admin");
const ProductsModel = require("../models/product");
const CategoryModel = require("../models/category");
const UsersModel = require("../models/Register");
const OrdersModel = require("../models/orders");
const BannersModel = require("../models/bannerModel");
const bcrypt = require("bcrypt");
const moment = require("moment");
const adminHelper = require("../helpers/adminHelper");
const CouponsModel = require("../models/couponModel");
const OfferProductsModel = require("../models/offerProduct");
const salesHelpers = require("../helpers/salesManagingHelper");
const fs = require("fs");

const adminControl = {
  //Admin
  adminDashboardView: async (req, res) => {
    try {
      let revenueDaily = await adminHelper.dailyRevenue();
      let revenueWeekly = await adminHelper.weeklyRevenue();
      let revenueYearly = await adminHelper.yearlyRevenue();
      let revenueTotal = await adminHelper.totalRevenue();

      let totalUsers = await adminHelper.getUsersCount();
      let ordersCount = await adminHelper.getOrdersCount();
      let deliveredCount = await adminHelper.getDeliveredOrderCount();
      let productsCount = await adminHelper.getProductsCount();
      res.render("admin/dashboard2", {
        revenueDaily,
        revenueWeekly,
        revenueYearly,
        revenueTotal,
        totalUsers,
        ordersCount,
        productsCount,
        deliveredCount,
      });
    } catch (error) {
      res.redirect("view-products");
    }
  },
  adminLoginView: (req, res) => {
    res.render("admin/login", { layout: "admin/login" });
  },
  adminLoginPost: async (req, res) => {
    const email = req.body.email;
    const pass = req.body.password;
    const adminDetails = await AdminsModel.findOne({ email: email });
    if (adminDetails == null) {
      res.render("admin/login", {
        error: true,
        msg: "Invalid Username or Password",
        layout: "admin/login",
      });
    } else {
      try {
        if (await bcrypt.compare(pass, adminDetails.password)) {
          // Setting Session
          req.session.userEmail = req.body.email;
          req.session.loggedIn = true;
          req.session.admin = true;
          res.redirect("/admin");
        } else {
          res.render("admin/login", {
            error: true,
            msg: "Invalid Username or Password",
            layout: "admin/login",
          });
        }
      } catch (error) {
        res.status(400).send(error);
      }
    }
  },
  addAdmin: (req, res) => {
    res.render("admin/add-admin");
  },
  addAdminPost: async (req, res) => {
    try {
      const password = req.body.password;
      const confirmPassword = req.body.cpassword;

      await AdminsModel.find({ email: req.body.email });
      const count = await AdminsModel.find({ email: req.body.email }).count();

      if (count != 0) {
        res.render("register", { userExist: true });
      } else {
        if (password === confirmPassword) {
          const passwordHashed = await bcrypt.hash(password, 10);
          const registerEmployee = new AdminsModel({
            name: req.body.name,
            email: req.body.email,
            password: passwordHashed,
          });

          await registerEmployee.save();
          res.status(201).redirect("/admin");
        } else {
          res.render("users/signup", { ero: true });
        }
      }
    } catch (error) {
      res.status(400).send(error);
    }
  },
  adminLogout: (req, res) => {
    req.session.destroy((err) => {
      if (err) console.log("Error loging out : ", err);
      else res.redirect("admin-login");
    });
  },

  //User
  usersView: async (req, res) => {
    const users = await UsersModel.find({}).sort({ _id: -1 });
    res.render("admin/users", { users });
  },
  blockUser: async (req, res) => {
    let uId = req.query.id;
    await UsersModel.updateOne(
      { _id: Object(uId) },
      { active: false },
      { upsert: true },
    );
    res.redirect("users");
  },
  unBlockUser: async (req, res) => {
    let uId = req.query.id;
    await UsersModel.updateOne(
      { _id: Object(uId) },
      { active: true },
      { upsert: true },
    );
    res.redirect("users");
  },

  //Products
  adminIconView: (req, res) => {
    res.render("admin/icons");
  },
  viewProducts: async (req, res) => {
    //sort by id mongoose?

    const products = await ProductsModel.find({}).sort({ _id: -1 });
    res.render("admin/admin-view-products", { products });
  },
  addProductsGet: async (req, res) => {
    const categories = await CategoryModel.find({});
    res.render("admin/add-product", { categories });
  },
  addProductsPost: async (req, res) => {
    await CategoryModel.find({});

    var img1, img2, img3, img4;
    if (req.files[0] != undefined) img1 = req.files[0].filename;
    if (req.files[1] != undefined) img2 = req.files[1].filename;
    if (req.files[2] != undefined) img3 = req.files[2].filename;
    if (req.files[3] != undefined) img4 = req.files[3].filename;

    const product = new ProductsModel({
      title: req.body.title,
      brand: req.body.brand,
      price: parseInt(req.body.price),
      gender: req.body.gender,
      category: req.body.category,
      description: req.body.description,
      productOfferActive: false,
      img1: img1,
      img2: img2,
      img3: img3,
      img4: img4,
      stock: req.body.stock,
    });

    await product.save();

    let categoryOfferCheck = await CategoryModel.findOne({
      $and: [{ categoryTitle: req.body.category }, { offerActive: true }],
    });
    if (categoryOfferCheck) {
      await ProductsModel.updateMany(
        { category: req.body.category },
        {
          categoryOfferActive: true,
          categoryOffer: {
            offerStart: categoryOfferCheck.offerStart,
            offerEnd: categoryOfferCheck.offerEnd,
            discount: categoryOfferCheck.discount,
            offerActive: true,
          },
        },
        { $upsert: true },
      );
    } else {
      console.log(205);
    }

    res.redirect("view-products");
  },
  deleteProduct: async (req, res) => {
    try {
      const productId = req.body.productId;
      await ProductsModel.deleteOne({ _id: Object(productId) });
      res.status(200).send({ success: true, message: "Success" });
    } catch (error) {
      res.status(400).send({ success: false, message: "Something went wrong" });
    }
  },
  editProductGet: async (req, res) => {
    let catId = req.query.id;
    const product = await ProductsModel.findOne({ _id: Object(catId) });
    const categories = await CategoryModel.find({});
    res.render("admin/edit-product", { product, categories });
  },
  editProductPost: async (req, res) => {
    try {
      let proData = req.body;
      let images = req.files;

      let oldProduct = await ProductsModel.findOne({
        _id: Object(proData.prdId),
      });

      var img1, img2, img3, img4;
      if (images.image1 != undefined) {
        if (fs.existsSync("./public/uploads/products/" + oldProduct.img1)) {
          //Check if file exists
          fs.unlinkSync("./public/uploads/products/" + oldProduct.img1);
        }
        img1 = images.image1[0].filename;
      }
      if (images.image2 != undefined) {
        if (fs.existsSync("./public/uploads/products/" + oldProduct.img2)) {
          //Check if file exists
          fs.unlinkSync("./public/uploads/products/" + oldProduct.img2);
        }
        img2 = images.image2[0].filename;
      }
      if (images.image3 != undefined) {
        if (fs.existsSync("./public/uploads/products/" + oldProduct.img3)) {
          //Check if file exists
          fs.unlinkSync("./public/uploads/products/" + oldProduct.img3);
        }
        img3 = images.image3[0].filename;
      }
      if (images.image4 != undefined) {
        if (fs.existsSync("./public/uploads/products/" + oldProduct.img4)) {
          //Check if file exists
          fs.unlinkSync("./public/uploads/products/" + oldProduct.img4);
        }
        img4 = images.image4[0].filename;
      }

      await ProductsModel.findByIdAndUpdate(
        { _id: Object(proData.prdId) },
        {
          title: proData.title,
          category: proData.category,
          gender: proData.gender,
          brand: proData.brand,
          price: parseInt(proData.price),
          description: proData.description,
          img1: img1,
          img2: img2,
          img3: img3,
          img4: img4,
          stock: proData.stock,
        },
      );
      res.redirect("view-products");
    } catch (error) {
      res.send("Error Occured");
    }
  },

  stockUpdate: async (req, res) => {
    try {
      await ProductsModel.updateOne(
        { _id: Object(req.body.productId) },
        { stock: req.body.stock },
      );
      res.status(200).send({ success: true, message: "Success" });
    } catch (error) {
      res.status(500).send({ message: error });
    }
  },

  //Categories
  categoriesView: async (req, res) => {
    const categories = await CategoryModel.find({}).sort({ _id: -1 });
    res.render("admin/categories", { categories });
  },
  addCategoryGet: (req, res) => {
    res.render("admin/add-category");
  },
  addCategoryPost: async (req, res) => {
    let img1;
    let count = await CategoryModel.find({
      categoryTitle: req.body.title,
    }).count();

    if (count == 0) {
      if (req.file != undefined) img1 = req.file.filename;

      let category;
      if (req.body.offerToggler) {
        category = new CategoryModel({
          categoryTitle: req.body.title,
          offerStart: req.body.startDate,
          offerEnd: req.body.endDate,
          discount: parseInt(req.body.percentage),
          offerActive: true,
          categoryActive: true,
          image: img1,
        });
      } else {
        category = new CategoryModel({
          categoryTitle: req.body.title,
          offerActive: false,
          categoryActive: true,
          image: img1,
        });
      }

      await category.save();

      res.redirect("categories");
    } else {
      res.render("admin/add-category", {
        error: true,
        msg: "Category already exists!",
      });
    }
  },
  editCategoryGet: async (req, res) => {
    let catId = req.query.id;
    const category = await CategoryModel.findOne({ _id: Object(catId) });
    res.render("admin/edit-category", { category });
  },
  editCategoryPost: async (req, res) => {
    const catid = req.body.catid;

    let currentCategory = await CategoryModel.findOne({ _id: catid });

    if (req.body.offerToggler) {
      await CategoryModel.updateOne(
        { _id: Object(catid) },
        {
          categoryTitle: req.body.title,
          offerStart: req.body.startDate,
          offerEnd: req.body.endDate,
          discount: parseInt(req.body.percentage),
          offerActive: true,
          categoryActive: true,
        },
        { upsert: true },
      );

      await ProductsModel.updateMany(
        { category: currentCategory.categoryTitle },
        {
          category: req.body.title,
          categoryOfferActive: true,
          categoryOffer: {
            offerStart: req.body.startDate,
            offerEnd: req.body.endDate,
            discount: parseInt(req.body.percentage),
            offerActive: true,
          },
        },
      );
    } else {
      await ProductsModel.updateMany(
        { category: currentCategory.categoryTitle },
        {
          category: req.body.title,
          categoryOfferActive: false,
          $unset: { categoryOffer: "" },
        },
      );
      await CategoryModel.updateOne(
        { _id: Object(catid) },
        {
          categoryTitle: req.body.title,
          offerActive: false,
          categoryActive: true,
          $unset: { discount: "", offerStart: "", offerEnd: "" },
        },
        { upsert: true },
      );
    }

    const getOldImg = await CategoryModel.findOne({ _id: Object(catid) });

    if (req.file) {
      if (fs.existsSync("./public/uploads/categories/" + getOldImg.image)) {
        //Check if file exists
        fs.unlinkSync("./public/uploads/categories/" + getOldImg.image);
      }
      await CategoryModel.updateOne(
        { _id: Object(catid) },
        { image: req.file.filename },
        { upsert: true },
      );
    }

    res.redirect("categories");
  },
  deleteCategory: async (req, res) => {
    try {
      const categoryId = req.body.categoryId;
      await CategoryModel.findOne({
        _id: Object(categoryId),
      });

      await CategoryModel.deleteOne({
        _id: Object(categoryId),
      });
      res.status(200).send({ success: true, message: "Success" });
    } catch (error) {
      res.status(400).send({ success: false, message: "Something went wrong" });
    }
  },

  //orders
  ordersViewAdmin: async (req, res) => {
    res.locals.moment = moment;
    let orders = await OrdersModel.find({}).sort({ date: -1 });

    let cartIds = await OrdersModel.distinct("cartId");
    cartIds.reverse();

    res.render("admin/orders-admin", { orders, cartIds });
  },
  changeOrderStatus: async (req, res) => {
    try {
      const orderId = req.body.order;
      const status = req.body.status;
      await OrdersModel.updateOne({ _id: Object(orderId) }, { status: status });

      res.status(200).send({ success: true, message: "Edit Success" });
    } catch (error) {
      res
        .status(400)
        .send({ success: false, message: "Error updating status" });
    }
  },
  viewOrderedProduct: async (req, res) => {
    const orderId = req.query.id;
    const result = await OrdersModel.findOne({ _id: Object(orderId) });
    res.render("admin/ordered-products-admin", { orederdItems: result.items });
  },

  // Coupons
  couponsGet: async (req, res) => {
    let coupons = await CouponsModel.find({}).sort({ _id: -1 });
    res.render("admin/coupons", { coupons });
  },
  addCouponsGet: (req, res) => {
    res.render("admin/add-coupon");
  },
  addCouponsPost: async (req, res) => {
    // let img1
    let count = await CouponsModel.find({ coupon: req.body.coupon }).count();

    if (count == 0) {
      const couponT = new CouponsModel({
        coupon: req.body.coupon,
        start: req.body.startDate,
        end: req.body.endDate,
        percentage: req.body.percentage,
      });

      await couponT.save();

      res.redirect("coupons");
    } else {
      res.render("admin/add-coupons", {
        error: true,
        msg: "Coupon already exists!",
      });
    }
  },
  editCouponGet: async (req, res) => {
    let couponId = req.query.id;
    let coupon = await CouponsModel.findOne({ _id: Object(couponId) });
    res.render("admin/edit-coupon", { coupon });
  },
  editCouponPost: async (req, res) => {
    await CouponsModel.updateOne(
      {
        _id: Object(req.body.couponId),
      },
      {
        coupon: req.body.coupon,
        start: req.body.startDate,
        end: req.body.endDate,
        percentage: req.body.percentage,
      },
      { upsert: true },
    );

    res.redirect("coupons");
  },
  deleteCoupon: async (req, res) => {
    try {
      const couponId = req.body.couponId;
      await CouponsModel.deleteOne({ _id: Object(couponId) });
      res.status(200).send({ success: true, message: "Success" });
    } catch (error) {
      res.status(400).send({ success: false, message: "Something went wrong" });
    }
  },

  //Product Offer
  offerProductsGet: async (req, res) => {
    let productsOffer = await OfferProductsModel.find({}).sort({ _id: -1 });

    let products = await OfferProductsModel.aggregate([
      {
        $project: {
          product: "$product",
          start: "$start",
          end: "$end",
          offerPercentage: "$offerPercentage",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productss",
        },
      },
    ]);

    res.render("admin/offers/products-offer", { productsOffer, products });
  },
  addProductOfferGet: async (req, res) => {
    try {
      let products = await ProductsModel.find({
        productOfferActive: { $ne: true },
      });
      res.render("admin/offers/add-product-offer", { products });
    } catch (error) {
      res.send("Something Went wrong!!" + error);
    }
  },
  addProductOfferPost: async (req, res) => {
    try {
      let percentage = parseInt(req.body.percentage);
      // let result = await ProductsModel.updateOne({_id: Object(req.body.product)},{productOffer:req.body,productOfferActive: true},{upsert: true})

      let productDetails = await ProductsModel.findOne({
        _id: Object(req.body.product),
      });
      const productOffer = new OfferProductsModel({
        product: Object(req.body.product),
        productTitle: productDetails.title,
        start: req.body.startDate,
        end: req.body.endDate,
        offerPercentage: percentage,
        active: true,
      });

      await productOffer.save();
      await ProductsModel.updateOne(
        { _id: Object(req.body.product) },
        { productOffer: productOffer, productOfferActive: true },
        { upsert: true },
      );

      res.status(200).send({ success: true, message: "Success" });
    } catch (error) {
      res.status(200).send({ success: false, message: "Something went wrong" });
    }
  },
  editOfferProductsGet: async (req, res) => {
    let products = await ProductsModel.find({
      productOfferActive: { $ne: true },
    });
    let offerId = req.query.id;
    let productOffer = await OfferProductsModel.findOne({
      _id: Object(offerId),
    });
    res.render("admin/offers/edit-product-offer", { products, productOffer });
  },
  editOfferProductsPatch: async (req, res) => {
    try {
      // let result = await ProductsModel.updateOne({_id: Object(req.body.product)},{productOffer:req.body,productOfferActive: true},{upsert: true})
      ObjectId(req.body.porduct);

      let productDetails = await ProductsModel.findOne({
        _id: Object(req.body.product),
      });
      let percentage = parseInt(req.body.percentage);

      await OfferProductsModel.updateOne(
        { _id: Object(req.body.offerId) },
        {
          product: Object(req.body.product),
          productTitle: productDetails.title,
          start: req.body.startDate,
          end: req.body.endDate,
          offerPercentage: percentage,
          active: true,
        },
      );
      await ProductsModel.updateMany(
        { _id: Object(req.body.product) },
        {
          productOffer: {
            product: Object(req.body.product),
            productTitle: productDetails.title,
            start: req.body.startDate,
            end: req.body.endDate,
            offerPercentage: percentage,
            active: true,
          },
        },
        { $upsert: true },
      );
      res.status(200).send({ success: true, message: "Success" });
    } catch (error) {
      res.status(200).send({ success: false, message: "Something went wrong" });
    }
  },
  deleteOfferProduct: async (req, res) => {
    try {
      const offerId = req.body.offerId;

      await OfferProductsModel.deleteOne({
        _id: Object(offerId),
      });

      await ProductsModel.updateOne(
        { _id: Object(req.body.productId) },
        { $unset: { productOffer: "" } },
      );
      res.status(200).send({ success: true, message: "Success" });
    } catch (error) {
      res.status(400).send({ success: false, message: "Something went wrong" });
    }
  },

  // Banners
  bannersView: async (req, res) => {
    try {
      let banners = await BannersModel.find({}).sort({ _id: -1 });
      res.render("admin/banner/banners", { banners });
    } catch (error) {
      res.render("layouts/somethingWentWrong");
    }
  },
  addBannerView: async (req, res) => {
    try {
      res.render("admin/banner/add-banner");
    } catch (error) {
      res.render("layouts/somethingWentWrong");
    }
  },
  addBannerPost: async (req, res) => {
    let img1;

    if (req.file != undefined) img1 = req.file.filename;

    let banner = new BannersModel({
      title1: req.body.title1,
      title2: req.body.title2,
      url: req.body.url,
      image: img1,
    });

    await banner.save();
    res.redirect("banners");
  },
  editBannerView: async (req, res) => {
    try {
      let banner = await BannersModel.findOne({ _id: Object(req.query.id) });
      res.render("admin/banner/edit-banner", { banner });
    } catch (error) {
      res.render("layouts/somethingWentWrong");
    }
  },
  editBannerPost: async (req, res) => {
    try {
      let currentBanner = await BannersModel.findOne({
        _id: Object(req.body.bannerId),
      });
      //   if (req.file != undefined) img1 = req.file.filename;

      await BannersModel.updateOne(
        {
          _id: Object(req.body.bannerId),
        },
        {
          title1: req.body.title1,
          title2: req.body.title2,
          url: req.body.url,
        },
        { upsert: true },
      );

      if (req.file) {
        if (fs.existsSync("./public/uploads/banner/" + currentBanner.image)) {
          //Check if file exists
          fs.unlinkSync("./public/uploads/banner/" + currentBanner.image);
        }
        await BannersModel.updateOne(
          { _id: Object(req.body.bannerId) },
          { image: req.file.filename },
          { upsert: true },
        );
      }
      res.redirect("banners");
    } catch (error) {
      res.render("layouts/somethingWentWrong");
    }
  },
  deleteBanner: async (req, res) => {
    try {
      const bannerId = req.body.bannerId;

      await BannersModel.deleteOne({ _id: Object(bannerId) });

      res.status(200).send({ success: true, message: "Success" });
    } catch (error) {
      res.status(400).send({ success: false, message: "Something went wrong" });
    }
  },

  // Sales Report
  viewSalesManagement: async (req, res) => {
    const data = await salesHelpers.monthlyReport();
    const daily = await salesHelpers.dailyReport();
    const weekly = await salesHelpers.weeklyReport();
    const yearly = await salesHelpers.yearlyReport();
    res.render("admin/salesReport", { data, daily, weekly, yearly });
  },
};

module.exports = adminControl;
