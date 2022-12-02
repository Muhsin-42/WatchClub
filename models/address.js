const mongoose = require('mongoose')
const ObjectId = require('mongoose').Types.ObjectId


const addressSchema = new mongoose.Schema({
    name:{
        type:String,
        required:false
    },
    userId:{
        type:ObjectId,
        required:false
    },
    email:{
        type:String,
        required:false
    },
    phone:{
        type:String,
        required:false
    },
    pincode: {
        type: String,
        required: false
    },
    fullAddress: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: false
    },
    district: {
        type: String,
        required: false
    },
    landmark: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    date:{
        type: Date,
        required: false
    }
})


// Create a collection
const AddressModel = new mongoose.model('address',addressSchema);

module.exports = AddressModel;