const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required:true
    }
})


// Create a collection
const AdminsModel = new mongoose.model('admins',adminSchema);

module.exports = AdminsModel;