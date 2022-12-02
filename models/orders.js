const mongoose = require('mongoose')
const ObjectId = require('mongoose').Types.ObjectId


const ordersSchema = new mongoose.Schema({
    userId:{
        type:ObjectId,
        required:false
    },
    cartId:{
        type:ObjectId,
        required:false
    },
    address:{
        type:Object,
        required:false
    },
    quantity:{
        type: String,
        required: false
    },
    amount:{
        type:String,
        required:false
    },
    paymentMode:{
        type:String,
        required:false
    },
    paymentStatus: {
        type: String,
        required: false
    },
    discountPercentage: {
        type: Number,
        required: false
    },
    coupon: {
        type: String,
        required: false
    },

    status: {
        type: String,
        required: false
    },
    items:{
        type:Object,
        required:false
    },
    product:{
        type:Object,
        required: false
    },
    date:{
        type: Date,
        required: false
    }
})


// Create a collection
const OrdersModel = new mongoose.model('orders',ordersSchema);

module.exports = OrdersModel;