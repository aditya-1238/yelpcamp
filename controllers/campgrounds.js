const Campground = require('../models/campground');
// const {isLoggedIn, isAuthor, validateCampground} = require('../middleware.js');


module.exports.index = async (req,res) =>{
    const campgrounds =  await Campground.find({});
    res.render('allcampgrounds',{campgrounds})
}

module.exports.renderNewForm = async (req,res) =>{
    res.render('create');
}

module.exports.createCampground  = async (req,res) =>{
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save(); 
    req.flash('success','Succesfully made a campground!')
    res.redirect(`/campgrounds/${campground._id}`)
    // res.send(req.body);     
}

module.exports.showCampground  = async (req,res) =>{
    const camp =  await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate:{
            path:'author'
        }
    }).populate('author');
    if(!camp){
        req.flash('error','Cannot find that campground :(')
         return res.redirect('/campgrounds')
    }
    // console.log(camp)
    res.render('campdetail',{camp})
}

module.exports.editCampground  =  async(req,res)=>{
    const camp =  await Campground.findById(req.params.id);
    if(!camp){
        req.flash('error','Cannot find that campground :(');
         return res.redirect('/campgrounds')
    }
    res.render('edit',{camp})
}


module.exports.updateCampground = async(req,res) =>{
    const id = req.params.id;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async(req,res) =>{
    const id = req.params.id;
     await Campground.findByIdAndDelete(id)
     req.flash('success','Succesfully deleted a campground')
    res.redirect(`/campgrounds`)
}


