const express         = require('express')
const session         = require('express-session')
const mongoose        = require('mongoose')
const bodyParser = require('body-parser')
const flash = require('connect-flash');
const moment=require('moment')

const bcrypt          = require('bcrypt');


const path            = require('path')
const app             = express()
app.use(flash());
const expressLayouts  = require('express-ejs-layouts')
 require('dotenv')
const userRoutes      = require('./routes/users-routes')
const adminRoutes     = require('./routes/admins-routes')
const Register = require('./models/Register');
const CartModel = require('./models/cart');

require('./connection/conn')

app.set('view engine','ejs')
app.set('views',__dirname+'/views')
app.set('layout','layouts/usersLayout')
app.use(expressLayouts)
app.use(express.static(path.join(__dirname,'public'))) 

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(session({
    secret: 'key',
    resave: false,
    saveUninitialized: true
}))

app.use(async function(req, res, next) {
    res.locals.userEmail = req.session.userEmail;
    res.locals.loggedIn = req.session.loggedIn;
    res.locals.moment = moment;
    next();
});


app.use('/',userRoutes.routes)
app.use('/admin',adminRoutes.routes)
app.use('*',(req,res)=>{
    res.render('users/error404')
})


app.listen(process.env.PORT || 3000)