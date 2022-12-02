const mongoose = require('mongoose')

const offerProductsSchema = new mongoose.Schema({
    product:{
        type:Object,
        required:false
    },
    productTitle : {
        type: String,
        required: false
    },
    start: {
        type: Date,
        required: false
    },
    end: {
        type: Date,
        required: false
    },
    offerPercentage: {
        type : Number,
        required: false
    },
    active: {
        type: Boolean,
        required: false
    }
})


// Create a collection
const OfferProductsModel = new mongoose.model('offerProducts',offerProductsSchema);

module.exports = OfferProductsModel;