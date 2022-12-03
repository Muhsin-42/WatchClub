const mongoose = require('mongoose');

// mongoose.connect("mongodb://localhost:27017/ecommerce", {
mongoose.connect("mongodb+srv://muhsin:20170119193@cluster0.8tkdq4l.mongodb.net/ecommerce", {
    useNewUrlParser:true
} ).then(()=>{
    console.log( 'Connection successful')
}).catch((e)=>{
    console.log(`Error = ${e}`);
})
