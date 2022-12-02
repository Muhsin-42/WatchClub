const mongoose = require('mongoose')

const couponsSchema = new mongoose.Schema({
    coupon:{
        type:String,
        required:false
    },
    start: {
        type: Date,
        required: false
    },
    end: {
        type: Date,
        required: false
    },
    percentage: {
        type : String,
        required: false
    },
    usedBy:{
        type: Array,
        required: false
    },
    active: {
        type: Boolean,
        required: false
    }
})


// Create a collection
const CouponsModel = new mongoose.model('coupons',couponsSchema);

module.exports = CouponsModel;