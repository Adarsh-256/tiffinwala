// const home = require("../models/home");
const flash = require("connect-flash");
const Menu = require("../models/menu");

module.exports.home = (req, res) => {
    res.render("home/home.ejs");
    flash("success", "Welcome to Tiffinwala");
}

module.exports.logout = (req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","You have been logged out!");
        res.redirect("/");
    });
} 

module.exports.searchbar = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.redirect("/home");

    const menu = await Menu.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { location: { $regex: query, $options: "i" } },
        { country: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    });
   if(menu.length === 0){
    return res.render("search/notfound",{query});
   }
    res.render("user/dashboard", {allMenu: menu });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
}
