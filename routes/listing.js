const express = require("express");
const router = express.Router();  //way to organize express application
const wrapAsync = require("../utils/wrapAsync.js");
const methodOverride = require("method-override");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema , reviewSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require('multer');      //package for file encoding
const {storage} = require("../CloudConfig.js");
const upload = multer({ storage });


// validation middleware
// const validateListing = (req,res,next) =>{
// let {error} = listingSchema.validate(req.body);
//     if(error){
//         let errmsg = error.details.map((el) => el.message).join(",");
//         throw new ExpressError(400,errmsg);
//     }else{
//         next();
//     }
// };



//router.route for making paths easier and readable(jo requests same path pe ja rhi h unko ek sath likhna)
router
.route("/")
.get(wrapAsync(listingController.index))     //index route
.post(isLoggedIn ,upload.single('listing[image]'),validateListing, wrapAsync (listingController.createListing));    //create route


// new route
router.get("/new" ,isLoggedIn, listingController.renderNewForm);

router
.route("/:id")
.get(wrapAsync(listingController.showListing))  //show route
.put( isLoggedIn ,isOwner, upload.single('listing[image]'),validateListing, wrapAsync(listingController.updateListing)) //update route
.delete(isLoggedIn ,isOwner, wrapAsync(listingController.destroyListing));

// index route
//router.get("/" ,wrapAsync(listingController.index));

// create route
//router.post("/",validateListing, wrapAsync (listingController.createListing));

// new route
//router.get("/new" ,isLoggedIn, listingController.renderNewForm
    // transferred to middleware file
    // if(!req.isAuthenticated()){
    //     req.flash("error","you must be logged in to create listing!");
    //     return res.redirect("/login");
    // }
//)




//show route
//router.get("/:id" ,wrapAsync(listingController.showListing));



// edit route
router.get("/:id/edit", isLoggedIn ,isOwner, validateListing,wrapAsync (listingController.renderEditForm                ));




// update route
// app.put("/listings/:id" , async (req,res) =>{
//     let {id} = req.params;
//     await Listing.findByIdAndUpdate(id, {...req.body.listing},{new:true});
//     res.redirect(`./listings`);
// });
//router.put("/:id", isLoggedIn ,isOwner, validateListing, wrapAsync(listingController.updateListing));


// delete route
//router.delete("/:id",isLoggedIn ,isOwner, wrapAsync(listingController.destroyListing));


module.exports = router;