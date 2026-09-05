const User = require("../models/user");
const Provider = require("../models/provider");
const passport = require("passport");

module.exports.signup = (req,res)=>{
    return res.render("users/signup.ejs");
};


module.exports.signupPost = async (req, res, next) => {
  try {
    let {
      username,
      email,
      password,
      role,
      businessName,
      phone,
      address
    } = req.body;

    const user = new User({
      username,
      email,
      role,
      businessName,
      phone,
      address
    });
console.log("Business Name:", businessName);

    const registeredUser = await User.register(user, password);
    if (role === "provider") {
      await Provider.create({
        owner: registeredUser._id,
        businessName,
        address,
      });
    }

    
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Tiffinwala");
      if(role === "provider"){
        res.redirect("/provider/index");
      } else {
        res.redirect("/user/index");
      }
      console.log(user);
    });

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};


module.exports.login = async(req,res)=>{
    res.render("users/login.ejs");
};

module.exports.loginPost = [
    passport.authenticate("local",{
    failureRedirect:"/login",
    failureFlash:true,
}),
   async(req,res)=>{
    req.flash("success", "welcome back!!");
    if(req.user.role==="provider"){
        res.redirect("/provider/index");
    } else{
        res.redirect("/user/index");
    }
   
}];



