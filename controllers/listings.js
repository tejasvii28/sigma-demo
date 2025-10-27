const Listing = require("../models/listing");
// npm install @mapbox/mapbox-sdk --legacy-peer-deps
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); //mapbox sdk for finding coordinates from location
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken});

module.exports.index = async(req,res) =>{
   const allListings = await Listing.find({});
   res.render("./listings/index.ejs", {allListings});
};



module.exports.renderNewForm = (req,res) =>{
    res.render("./listings/new.ejs")
};



module.exports.showListing = async(req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews",
        populate:{
            path:"author",
        }
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for, does not exist!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("./listings/show.ejs" , {listing});
};



module.exports.createListing = async (req,res,next) =>{
    let response = await geocodingClient
    .forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
    .send();

    //console.log(response.body.features[0].geometry);
    // res.send("done!");

    let url = req.file.path;
    let filename = req.file.filename;
    //console.log(url, ".." ,filename);

    // if(!req.body.listing){
    //     throw new ExpressError(400, "send valid data for listing");
    // }
    //let {title, description, image, price, location, country} = req.body;
    const newListing = new Listing(req.body.listing);
    //console.log(req.user);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};

    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);

    console.log(newListing);
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
    
}


module.exports.renderEditForm = async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for, does not exist!");
        return res.redirect("/listings");
    }
    // code for loading lower quality image in edit form
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload" ,"/upload/w_250");  //through cloudinary we got to know what to replace
    res.render("./listings/edit.ejs", {listing,originalImageUrl});
}

module.exports.updateListing = async (req, res) => {
    // this work will be done using middleware validateListing
    // if(!req.body.listing){
    //     throw new ExpressError(400, "send valid data for listing");
    // }
    let { id } = req.params;
    let updateData = req.body.listing;
    if (updateData.image && typeof updateData.image === 'string') {
        updateData.image = { 
            url: updateData.image, 
            filename: "default" // Or retrieve the old filename if needed
        };
    } //else {
        //delete updateData.image;
    //}
// moved to middleware
    // let listing = await Listing.findById(id);
    // if(!listing.owner._id.equals(res.locals.currUser._id)){
    //     req.flash("error","You don't have permission to edit");
    //     return res.redirect(`/listings/${id}`);
    // }
    let listing = await Listing.findByIdAndUpdate(id, updateData);

    if(typeof req.file !== "undefined"){
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url,filename};
    await listing.save();
    }
    req.flash("success", " Listing Updated!");
    res.redirect(`/listings/${id}`);
}


module.exports.destroyListing = async (req,res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
     req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}