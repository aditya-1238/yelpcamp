const express =require('express');
const mongoose = require('mongoose');
const Joi = require('joi');
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const AppError = require('./AppError');
const ExpressErrors = require('./utilities/ExpressErrors')
const catchAsync = require('./utilities/catchAsync');
const Review = require('./models/review')
const {campgroundSchema, reviewSchema} = require('./schemas.js');
const usersRoutes = require('./routes/users')
const campgroundsRoutes = require('./routes/campgrounds')
const reviewsRoutes = require('./routes/reviews')
const session = require('express-session')
const flash = require("connect-flash")
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./models/user')


const db = mongoose.connection;


mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
.then(()=>{
    console.log('connection open')
})
.catch((err)=>{
    console.log('error')
    console.log(err)
})






const app = express();




app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_met'));
app.use(express.static(path.join(__dirname,'public')));


app.engine('ejs',ejsMate);

const sessionConfig = {
    secret: 'bettersecret',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60*24*7,
        maxAge: 1000 * 60 * 60*24*7
    }

}
app.use(session(sessionConfig))

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(flash())
app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next()
})


app.use('/', usersRoutes)
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)



app.get('/', (req,res) => {
    res.render('home')
})

//error generating link
app.get('/error', (req,res) =>{
    itsibitsyspider.id();
})





app.all('*',(req,res,next) =>{
   next( new ExpressErrors('Page not found!', 404))

})

app.get('/admin', (req,res) => {
    throw new AppError('You are not an Admin!', 403)
} )



app.use((err, req, res, next) => {
    const{status = 500} = err;
    if(!err.message) err.message ='Something went wrong ewwww! lol';
    res.status(status).render('error', {err})
    // res.send(message)
    // next()
   
    res.send('Oh boy, something went wrong!')
})





app.listen(3000, () => {
    console.log('Serving on port 3000');
})

