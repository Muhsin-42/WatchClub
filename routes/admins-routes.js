const express = require('express')
const router = express.Router()
const multer        =   require('multer')
const moment = require("moment");
const bodyParser = require('body-parser')
const adminHelper = require('../helpers/adminHelper')
const salesController = require('../controllers/salesManagementController')
var app = express();

router.use(bodyParser.json());

// const fileUpload = require('express-fileupload');

// router.use(fileUpload());
// Setting layout for the admin pages
const setAdminLayout = (req, res, next) => {
    res.locals.layout = 'layouts/adminsLayout'
    next()
}
router.use(setAdminLayout)
const adminControl = require('../controllers/adminController')



const adminLoginCheck = ((req,res,next)=>{

    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');

    if(!req.session.loggedIn)
        res.redirect('admin-login')
    else if(!req.session.admin)
        res.redirect('/')
    else
        next();
})

const forLogin =  ((req,res,next)=>{
    if(req.session.loggedIn&&req.session.admin)
        res.redirect('/admin')
    else if(req.session.loggedIn &&  !req.session.admin)
        res.redirect('/')
    else
        next();
}) 

// ///////////////////////////
    // CATEGORIES MULTER START
// //////////////////////////
// //Define Storage for images
    const categoryStorage = multer.diskStorage({
        destination: (req,file,callback)=>{
            callback(null,'./public/uploads/categories')
        },

        //extention
        filename: (req,file,callback)=>{
            callback(null,Date.now()+file.originalname)
        }
    })

    //upload parameters for multer
    const upload = multer({
        storage: categoryStorage,
        limits:{
            fieldSize: 1024*1024*5
        }
    })
// ///////////////////////////
    // CATEGORIES MULTER ENDS
// //////////////////////////
// ///////////////////////////
    // PRODUCT MULTER START
// //////////////////////////
// //Define Storage for images
    const productStorage = multer.diskStorage({
        destination: (req,file,callback)=>{
            callback(null,'./public/uploads/products')
        },

        //extention
        filename: (req,file,callback)=>{
            callback(null,Date.now()+file.originalname)
        }
    })

    //upload parameters for multer
    const uploadPrdt = multer({
        storage: productStorage,
        limits:{
            fieldSize: 1024*1024*5
        }
    })
// ///////////////////////////
    // CATEGORIES MULTER ENDS
// //////////////////////////


// ///////////////////////////
    // EDIT CATEGORY
// //////////////////////////

const storageEngine = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, "./public/uploads/categories") },
    filename: (req, file, cb) => { cb(null, file.originalname) }, 
})

const imageFilter = (req, file, cb) => {
    if ( file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg") {
        cb(null, true) } else { cb(null, false)}
    }

uploadHandler = multer({ storage: storageEngine, fileFilter: imageFilter })

// ///////////////////////////
    // EDIT CATEGORY END
// //////////////////////////







router.get('/',adminLoginCheck,adminControl.adminDashboardView)
// chart data
router.get('/chart-data', (req, res) => {
    adminHelper.getchartData().then((obj) => {
        console.log('/chart-data',obj);
        let result = obj.result
        let weeklyReport = obj.weeklyReport
        res.json({ data: result, weeklyReport })
    })
})
router.get('/admin-login',forLogin,adminControl.adminLoginView)
router.post('/admin-login',forLogin,adminControl.adminLoginPost)
router.post('/add-admin',adminLoginCheck,adminControl.addAdminPost)
router.get('/icons',adminLoginCheck,adminControl.adminIconView)
router.get('/add-admin',adminLoginCheck,adminControl.addAdmin)
router.get('/users',adminLoginCheck,adminControl.usersView)
router.get('/block-user',adminLoginCheck,adminControl.blockUser)
router.get('/unblock-user',adminLoginCheck,adminControl.unBlockUser)
router.get('/admin-logout',adminLoginCheck,adminControl.adminLogout)

//Categories
router.get('/categories',adminLoginCheck,adminControl.categoriesView)
router.get('/add-category',adminLoginCheck,adminControl.addCategoryGet)
router.post('/add-category',upload.single('image'),adminControl.addCategoryPost)
router.get('/edit-category',adminLoginCheck,adminControl.editCategoryGet);
router.post('/edit-category',upload.single('image'),adminControl.editCategoryPost);
router.delete('/delete-category',adminLoginCheck,adminControl.deleteCategory)

//Products
router.get('/view-products',adminLoginCheck,adminControl.viewProducts)
router.get('/add-product',adminLoginCheck,adminControl.addProductsGet)
router.post('/add-product',adminLoginCheck,uploadPrdt.array('image1',4),adminControl.addProductsPost)
router.delete('/delete-product',adminLoginCheck,adminControl.deleteProduct)
router.get('/edit-product',adminLoginCheck,adminLoginCheck,adminControl.editProductGet)

// products stock
router.patch('/stock-update',adminLoginCheck,adminControl.stockUpdate)

//orders
router.get('/orders',adminLoginCheck,adminControl.ordersViewAdmin)
router.post('/change-order-status',adminLoginCheck,adminControl.changeOrderStatus)
router.get('/view-order-products',adminLoginCheck,adminControl.viewOrderedProduct)

//Coupons
router.get('/coupons',adminLoginCheck,adminControl.couponsGet)
router.get('/add-coupons',adminLoginCheck,adminControl.addCouponsGet)
router.post('/add-coupon',adminLoginCheck,adminControl.addCouponsPost)
router.get('/edit-coupon',adminLoginCheck,adminControl.editCouponGet)
router.post('/edit-coupon',adminLoginCheck,adminControl.editCouponPost)
router.delete('/delete-coupon',adminLoginCheck,adminControl.deleteCoupon)

//Product - Offer
router.get('/offer-products',adminLoginCheck,adminControl.offerProductsGet)
router.get('/add-product-offer',adminLoginCheck,adminControl.addProductOfferGet)
router.post('/add-product-offer',adminLoginCheck,adminControl.addProductOfferPost)
router.get('/edit-offer-product',adminLoginCheck,adminControl.editOfferProductsGet)
router.patch('/edit-product-offer',adminLoginCheck,adminControl.editOfferProductsPatch)
router.delete('/delete-product-offer',adminLoginCheck,adminControl.deleteOfferProduct)

//Banner
router.get('/banners',adminControl.bannersView)
router.get('/add-banners',adminControl.addBannerView)



// Sales Report
router.get('/sale-report',adminLoginCheck,adminControl.viewSalesManagement)





//Edit Product
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/products')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname)
    }
})
const filefilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const uploadImage = multer({ storage: storage, fileFilter: filefilter })
const uploadMultipleFiled = uploadImage.fields([{name:'image1', maxCount:1}, {name:'image2',maxCount:1},{name:'image3',maxCount:1},{name:'image4',maxCount:1}])

router.post('/edit-product',uploadMultipleFiled, adminControl.editProductPost)





module.exports = {
    routes: router
}