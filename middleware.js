const {campgroundSchema, reviewSchema} = require('./schemas.js')
const ExpressErrors = require('./utilities/ExpressErrors')
const Campground = require('./models/campground')
const Review = require('./models/review')

module.exports.isLoggedIn = (req,res,next) =>{
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must sign in!');
        return res.redirect('/login');

    }
    next()
} 

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        // console.log("req.session.returnTo",req.session.returnTo)
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.validateCampground = (req,res,next) => {
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(elm => elm.message).join(',')
        throw new ExpressErrors(msg, 400);
    }
    else{
        next()
    }
    
} 

module.exports.isAuthor = async (req,res,next) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You do not have permisison')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}


module.exports.isReviewAuthor = async (req,res,next) =>{
    const {id,reviewId} = req.params;
    const Rev = await Review.findById(reviewId);
    if(!Rev.author.equals(req.user._id)){
        req.flash('error','You do not have permisison')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

module.exports.validateReview = (req,res,next) =>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(elm => elm.message).join(',')
        throw new ExpressErrors(msg, 400);
    }
    else{
        next()
    }
    
}

