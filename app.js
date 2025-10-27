if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
// console.log(process.env.SECRET);


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js"); //grayout means not useful
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const Review = require("./models/review.js");
const {reviewSchema} = require("./schema.js");
// session ki information ko online save krane k liye
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const {isLoggedIn} = require("./middleware.js");

const listingRouter = require("./routes/listing.js"); //express router
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

main()
.then((res) =>{
    console.log("connection successful");
})
.catch((err) =>{
    console.log(err);
})

async function main(){
    //await mongoose.connect(MONGO_URL);
    await mongoose.connect(dbUrl);
}


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));



const store = MongoStore.create({
   mongoUrl: dbUrl,
   crypto:{
    // secret:"mysupersecretcode"
    secret: process.env.SECRET,
   },
   touchAfter: 24 * 60 *60,
})

store.on("error", () =>{
    console.log("ERROR IN MONGO SESSION STORE",err);
})

// express session(cookie) - track session
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized : false,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,  //7days,24hours,60min,60sec,1000milisecond
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,  //for cross script attack
    }
}

// app.get("/",(req,res) =>{
//    res.send("Hi, i am robot.")
// });




app.use(session(sessionOptions));
app.use(flash());

// passport session ko use krega isiliye niche h
app.use(passport.initialize());   //middleware that intialize passport
app.use(passport.session());      //ability to identify user when they browse page to page
passport.use(new LocalStrategy(User.authenticate()));  //use staticc authenticate method of model in localstrategy

passport.serializeUser(User.serializeUser());   //save info of user
passport.deserializeUser(User.deserializeUser());    //unsave



app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


// demouser route
app.get("/demouser", async(req,res)=>{
    let fakeUser = new User({
        email: "student123@gmail.com",
        username: "sigma-student",
    });

    // this is a register method which registers new userinstance with given password & takes two params user and password and automatically check if username is unique or not
    let registeredUser = await User.register(fakeUser , "helloworld");
    res.send(registeredUser);
})

// listing.js me sbhi jagah se /listings hatake yha add kr dia h
app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/",userRouter);


// app.get("/testListing",async (req,res) =>{
//     let sampleListing = new Listing({
//         title:"my new villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country:"India"
// });
//  await sampleListing.save();
//  console.log("sample was saved");
//  res.send("successful testing");
// })



// normal error handling middleware(wrapAsync)
// app.use((err,req,res,next) =>{
//     res.send("something went wrong");
// })


// using express error file
// when search not matches any route this is default response

app.use((req, res, next) => {
  next(new ExpressError(404,"Page not Found!!"));
});


app.use((err,req,res,next) =>{
    let {statusCode = 500, message = "something went wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
});

app.listen(8080, () =>{
    console.log("server is listening on port 8080");
});