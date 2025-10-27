const express = require("express");
const router = express.Router({mergeParams: true}); //this means letting child route to access id which parent route is using in express routing
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const {reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isAuthor} = require("../middleware.js")

// validate review
// const validateReview = (req,res,next) =>{
// let {error} = reviewSchema.validate(req.body);
//     if(error){
//         let errmsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400,errmsg);
//     }else{
//         next();
//     }
// };

const reviewController = require("../controllers/reviews.js");

// post route
router.post("/",isLoggedIn,validateReview ,wrapAsync(reviewController.createReview ));


// delete route
router.delete("/:reviewId" ,isLoggedIn, isAuthor, wrapAsync( reviewController.destroyReview));

module.exports = router;