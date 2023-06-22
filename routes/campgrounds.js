const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const ExpressErrors = require('../utilities/ExpressErrors')
const catchAsync = require('../utilities/catchAsync');
const {campgroundSchema} = require('../schemas.js');




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


router.get('/', catchAsync( async (req,res) =>{
    const campgrounds =  await Campground.find({});
    res.render('allcampgrounds',{campgrounds})
    
})) 

router.get('/new', catchAsync(async (req,res) =>{
    res.render('create');
    
}))
router.post('/', validateCampground, catchAsync( async (req,res) =>{
    const campground = new Campground(req.body.campground);
    await campground.save(); 
    req.flash('success','Succesfully made a campground!')
    res.redirect(`/campgrounds/${campground._id}`)
    // res.send(req.body);     
}))


router.get('/:id/edit',  catchAsync(async(req,res)=>{
    const camp =  await Campground.findById(req.params.id);
    if(!camp){
        req.flash('error','Cannot find that campground :(');
         return res.redirect('/campgrounds')
    }
    res.render('edit',{camp})
}))
router.get('/:id', catchAsync( async (req,res) =>{
    const camp =  await Campground.findById(req.params.id).populate('reviews');
    if(!camp){
        req.flash('error','Cannot find that campground :(')
         return res.redirect('/campgrounds')
    }
    // console.log(camp)
    res.render('campdetail',{camp})
}))

router.put('/:id', validateCampground, catchAsync(async(req,res) =>{
    const id = req.params.id;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', catchAsync(async(req,res) =>{
    const id = req.params.id;
     await Campground.findByIdAndDelete(id)
     req.flash('success','Succesfully deleted a campground')
    res.redirect(`/campgrounds`)
}))


module.exports = router;