const express =require('express');
const mongoose = require('mongoose');
const path = require('path');
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');



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
app.engine('ejs',ejsMate);


app.get('/', (req,res) => {
    res.render('home')
})


app.get('/campgrounds', async (req,res) =>{
    const campgrounds =  await Campground.find({});
    
    res.render('allcampgrounds',{campgrounds})
    
});  

app.post('/campgrounds', async (req,res) =>{
    const campground = new Campground(req.body.campground)
    await campground.save(); 
    res.redirect(`/campgrounds/${campground._id}`)
    // res.send(req.body);     
})

app.get('/campgrounds/new', async (req,res) =>{
    res.render('create');
    
});

app.get('/campgrounds/:id/edit', async(req,res)=>{
    const camp =  await Campground.findById(req.params.id);
    res.render('edit',{camp})
})
app.get('/campgrounds/:id', async (req,res) =>{
    const camp =  await Campground.findById(req.params.id);
    // console.log(camp)
    res.render('campdetail',{camp})
});

app.put('/campgrounds/:id', async(req,res) =>{
    const id = req.params.id;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id', async(req,res) =>{
    const id = req.params.id;
     await Campground.findByIdAndDelete(id)
    res.redirect(`/campgrounds`)
})




app.listen(3000, () => {
    console.log('Serving on port 3000');
})

