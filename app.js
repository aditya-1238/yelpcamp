if( process.env.NODE_ENV !== "production"){
    require('dotenv').config()
}

// console.log()

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
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet');

const MongoDBStore = require('connect-mongo')(session);



const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelpCamp';


mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    
    useUnifiedTopology: true,
    
}).then(()=>{
    console.log("mongodb is connected");
}).catch((error)=>{
    console.log("mondb not connected");
    console.log(error);
});
// .then(()=>{
    //     console.log('connection open')
    // })
    // .catch((err)=>{
        //     console.log('error')
        //     console.log(err)
        // })
        
        const db = mongoose.connection;
        db.on("error", console.error.bind(console, "connection error:"));
        db.once("open", () => {
            console.log("Database connected");
        });
        
        
        
        
        
const app = express();




app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_met'));
app.use(express.static(path.join(__dirname,'public')));
app.use(mongoSanitize())

app.engine('ejs',ejsMate);

const store = new MongoDBStore({
    url: dbUrl,
    secret: 'bettersecretcanbeused!',
    touchAfter: 24*60*60
})

store.on('error', function(e){
    Console.log("SESSION STORE ERROR!",e);
})

const sessionConfig = {
    store,
    name:'session',
    secret: 'bettersecretcanbeused!',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        // secure: true, means cookies can be accessed only https but local server connection http
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
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dfcnf45hr/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);




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

