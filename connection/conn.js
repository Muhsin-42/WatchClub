const mongoose = require('mongoose');
let dotenv = require('dotenv').config()


// mongoose.connect("mongodb://localhost:27017/ecommerce", {
mongoose.connect('mongodb+srv://muhsin:S3z6SNe86y5MmxrD@cluster0.8tkdq4l.mongodb.net/ecommerce', {
    useNewUrlParser:true
} ).then(()=>{
    console.log( 'Connection successful')
}).catch((e)=>{
    console.log(`Error = ${e}`);
})
