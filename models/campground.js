const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };


const imgSchema = new Schema({
    
    url: String,
    filename: String
})

imgSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload/','/upload/w_200/');
})

const CampgroundSchema = new Schema({
    title: String,
    price: Number,
    images: [imgSchema],
    description: String,
    geometry: {
        type: {
          type: String, 
          enum: ['Point'], 
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    location: String,
    author:{
        type: Schema.Types.ObjectId,
        ref:'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
},opts)

CampgroundSchema.post('findOneAndDelete', async function (doc){
    if(doc){
        await review.deleteMany({
            _id:{
                $in: doc.reviews
            }
        })
    }
})

CampgroundSchema.virtual('properties.popUpMarkup').get(function(){
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong><p>${this.location}</p>`;
})

module.exports = mongoose.model('Campground', CampgroundSchema);


