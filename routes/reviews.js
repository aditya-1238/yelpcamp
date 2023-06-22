const express = require('express');
const router = express.Router({mergeParams: true});

const Campground = require('../models/campground');
const Review = require('../models/review');

const ExpressErrors = require('../utilities/ExpressErrors')
const catchAsync = require('../utilities/catchAsync');
const {reviewSchema} = require('../schemas.js');



const validateReview = (req,res,next) =>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(elm => elm.message).join(',')
        throw new ExpressErrors(msg, 400);
    }
    else{
        next()
    }
    
}


router.post('/', validateReview, catchAsync(async(req,res) =>{
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review)
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success','Succesfully created a review')
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:reviewId', catchAsync( async(req,res) =>{
    const{id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull:{reviews: reviewId}})
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Succesfully deleted a review')
    res.redirect(`/campgrounds/${id}`);
}))


module.exports = router;