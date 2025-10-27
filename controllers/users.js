const User = require("../models/user");

module.exports.renderSignupForm = (req,res) =>{
    res.render("user/signup.ejs");
};


module.exports.signUp = async(req,res,next) =>{
    try{let {username, email, password} = req.body;
    const newUser = new User ({email, username});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    // ye block of code user ko sign up ke bad direct login rehne ke liye h
    await new Promise((resolve,reject) =>{
    req.login(registeredUser , (err) =>{
        if(err) return reject(err);
        resolve(); 
    });
         req.flash("success", "Welcome to Wanderlust");
         res.redirect("/listings");
    });
   
} catch(e){  //ye hume error msg flash krake redirect kr dega bina kisi random page pe le jaye isiliye try catch use kia
    req.flash("error",e.message);
    res.redirect("/signup");
}
}


module.exports.renderLoginForm = (req,res) =>{
    res.render("user/login.ejs");
}

module.exports.login = async(req,res) =>{
    req.flash("success" ,"Welcome to Wanderlust! You are logged in!");
    // agr login krne pe home page hai to koi middleware trigger nhi hua jisse path undefined reh gya uske liye ye line h
    // agr undefined hoga to listings pe redirect krega
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
}

module.exports.logout = (req,res) =>{
    //callback is for agr logout krte time koi error aa jaye to ya logout ke bad kya show krna h
    req.logout((err) =>{
        if(err){
            next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/listings");
    })
}