const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    categoryTitle:{
        type:String,
        required:false
    },
    categoryActive:{
        type: Boolean,
        required:false
    },
    offerStart:{
        type: Date,
        required:false
    },
    offerEnd:{
        type: Date,
        required:false
    },
    offerActive:{
        type: Boolean,
        required:false
    },
    discount:{
        type:Number,
        required:false
    },
    image: {
        type: String,
        required: false
    }
})


// Create a collection
const CategoryModel = new mongoose.model('categories',categorySchema);

module.exports = CategoryModel;