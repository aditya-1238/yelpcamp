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

const {campgroundSchema} = require('./schemas.js');


const db = mongoose.connection;


mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
.then(()=>{
    console.log('connection open')
})
.catch((err)=>{
    console.log('error')
    console.log(err)
})

const validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(elm => elm.message).join(',')
        throw new ExpressErrors(msg, 400);
    }
    else{
        next()
    }
    
}

const app = express();




app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_met'));
app.engine('ejs',ejsMate);





app.get('/', (req,res) => {
    res.render('home')
})

//error generating link
app.get('/error', (req,res) =>{
    itsibitsyspider.id();
})

app.get('/campgrounds', catchAsync( async (req,res) =>{
    const campgrounds =  await Campground.find({});
    res.render('allcampgrounds',{campgrounds})
    
})) 

app.post('/campgrounds', validateCampground, catchAsync( async (req,res) =>{
    const campground = new Campground(req.body.campground)
    await campground.save(); 
    res.redirect(`/campgrounds/${campground._id}`)
    // res.send(req.body);     
}))

app.get('/campgrounds/new', catchAsync(async (req,res) =>{
    res.render('create');
    
}))

app.get('/campgrounds/:id/edit',  catchAsync(async(req,res)=>{
    const camp =  await Campground.findById(req.params.id);
    res.render('edit',{camp})
}))
app.get('/campgrounds/:id', catchAsync( async (req,res) =>{
    const camp =  await Campground.findById(req.params.id);
    // console.log(camp)
    res.render('campdetail',{camp})
}))

app.put('/campgrounds/:id', validateCampground, catchAsync(async(req,res) =>{
    const id = req.params.id;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async(req,res) =>{
    const id = req.params.id;
     await Campground.findByIdAndDelete(id)
    res.redirect(`/campgrounds`)
}))

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

