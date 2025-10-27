const express = require("express");
const router = express.Router(); 
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");


//signup
router
.route("/signup")
.get( userController.renderSignupForm)
.post( wrapAsync(userController.signUp));


//login
router
.route("/login")
.get(userController.renderLoginForm)
// middleware passport.authenticate jisme 1st param method h,  2nd failureredirect mtlb fail hoke kaha redirect hoga , 3rd fail hone pe flash msg
.post(saveRedirectUrl, passport.authenticate("local",{failureRedirect: '/login' , failureFlash:true}) ,
userController.login)


router.get("/logout", userController.logout);


module.exports = router;