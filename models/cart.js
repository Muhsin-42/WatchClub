const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:false
    },
    products: {
        type: Array,
        required: false
    },
    dateCart : {
        type: Date,
        required: false
    },
    active:{
        type: Boolean,
        required: false
    }

})


// Create a collection
const CartModel = new mongoose.model('cart',cartSchema);

module.exports = CartModel;