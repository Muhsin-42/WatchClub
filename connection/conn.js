const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/ecommerce", {
    useNewUrlParser:true
} ).then(()=>{
    console.log( 'Connection successful')
}).catch((e)=>{
    console.log(`Error = ${e}`);
})
