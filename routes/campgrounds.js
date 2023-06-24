const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const ExpressErrors = require('../utilities/ExpressErrors');
const catchAsync = require('../utilities/catchAsync');
const {campgroundSchema} = require('../schemas.js');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware.js');
const campgrounds = require('../controllers/campgrounds')

router.route('/')
    .get(catchAsync( campgrounds.index ))
    .post( isLoggedIn ,validateCampground, catchAsync( campgrounds.createCampground))

router.get('/new',isLoggedIn, catchAsync(campgrounds.renderNewForm))

router.route('/:id')
    .get(catchAsync( campgrounds.showCampground))
    .put(isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit',isLoggedIn, isAuthor ,  catchAsync(campgrounds.editCampground))

module.exports = router;