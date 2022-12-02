const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title:{
        type:String,
        required:false
    },
    brand:{
        type:String,
        required:false
    },
    price:{
        type:Number,
        required:false
    },
    gender:{
        type:String,
        required:false
    },
    category:{
        type:String,
        required: false
    },
    description:{
        type: String,
        required: false
    },
    stock:{
        type: Number,
        required: false
    },
    productOffer:{
        type:Object,
        required: false
    },
    productOfferActive: {
        type: Boolean,
        required: false
    },
    categoryOffer:{
        type:Object,
        required: false
    },
    categoryOfferActive: {
        type: Boolean,
        required: false
    },

    img1: {
        type: String,
        required: false
    },
    img2: {
        type: String,
        required: false
    },
    img3: {
        type: String,
        required: false
    },
    img4: {
        type: String,
        required: false
    }
})


// Create a collection
const ProductsModel = new mongoose.model('products',productSchema);

module.exports = ProductsModel;