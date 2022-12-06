const mongoose = require('mongoose')

const bannerSchema = new mongoose.Schema({
    title1:{
        type:String,
        required:false
    },
    title2:{
        type: String,
        required:false
    },
    url:{
        type: String,
        required:false
    },
    image:{
        type: String,
        required:false
    }
})


// Create a collection
const BannersModel = new mongoose.model('banners',bannerSchema);

module.exports = BannersModel;