const mongoose = require('mongoose');
let dotenv = require('dotenv').config()


// mongoose.connect("mongodb://localhost:27017/ecommerce", {
mongoose.connect(dotenv.parsed.MongoDB, {
    useNewUrlParser:true
} ).then(()=>{
    console.log( 'Connection successful')
}).catch((e)=>{
    console.log(`Error = ${e}`);
})
