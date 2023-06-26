
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const citydata = require('./in.json');
const {descriptors,places} = require('./seedHelper.js');


const db = mongoose.connection;


mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp')
.then(()=>{
    console.log('connection open')
})
.catch((err)=>{
    console.log('error')
    console.log(err)
})

const randomDataFromArray = array =>    array[Math.floor(Math.random()*array.length)]



const seedDB = async ()  => {
    await Campground.deleteMany({});
    for(let i = 0; i<40; i++){
        const randlol = Math.floor(Math.random()*140);
        const randprice = Math.floor(Math.random()*100)*100+6000;
        const location = `${citydata[randlol].city}, ${citydata[randlol].admin_name}`;
        const c = new Campground({
            location: location,
        title: `${randomDataFromArray(descriptors)} ${randomDataFromArray(places)}`, 
        author: '64943f7e8ec9dcf688567c7d',
        images: [
            {
                url:'https://res.cloudinary.com/dfcnf45hr/image/upload/v1687683857/YelpCamp/ltdmamvm3jcb8oz2i4wf.jpg',
                filename: 'Tent1'
            },
            {
                url:'https://res.cloudinary.com/dfcnf45hr/image/upload/v1687684128/YelpCamp/181060_ccfz88.jpg',
                filename: 'Camp2'
            }
        ],  
        geometry:{
            type: 'Point',
              coordinates: [citydata[randlol].lng, citydata[randlol].lat],
        },
    description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus doloribus tempora recusandae ipsum quae expedita culpa ex quaerat suscipit blanditiis, excepturi nulla, natus laudantium rerum autem aliquid voluptates minima dicta!',
price: randprice})
        await c.save();
    }


}

seedDB().then(() => {
    db.close();
})