const Campground = require('../models/campground');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken});
const {cloudinary} = require('../cloudinary');


module.exports.index = async (req,res) =>{
    const campgrounds =  await Campground.find({});
    
    
    res.render('allcampgrounds',{campgrounds})
}

module.exports.renderNewForm = async (req,res) =>{
    res.render('create');
}

module.exports.createCampground  = async (req,res) =>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = (geoData.body.features[0].geometry    )
    campground.author = req.user._id;
    campground.images = req.files.map(f=>({
        url: f.path, filename: f.filename
    }))
    await campground.save(); 
    req.flash('success','Succesfully made a campground!')
    res.redirect(`/campgrounds/${campground._id}`)
       
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
    const imgs = req.files.map(f=>({
        url: f.path, filename: f.filename
    }))
    campground.images.push(...imgs);
    await campground.save()
    
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename)
        }
        await campground.updateOne({$pull: {images:{filename: {$in: req.body.deleteImages}}}})
        
    }
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async(req,res) =>{
    const id = req.params.id;
     await Campground.findByIdAndDelete(id)
     req.flash('success','Succesfully deleted a campground')
    res.redirect(`/campgrounds`)
}


