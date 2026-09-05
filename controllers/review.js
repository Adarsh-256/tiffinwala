const Review = require("../models/review");
const Menu = require("../models/menu");

module.exports.postReview = (async (req,res) =>{
    const {id} = req.params;
    let menu = await Menu.findById(id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    menu.reviews.push(newReview);
    await newReview.save();
    await menu.save();
    req.flash("success", "Review added");
    console.log("new review saved");
    //res.send("New Review saved successfully");
    res.redirect(`/provider/menu/${id}`);
});  

module.exports.deleteReview = async(req,res)=>{
    const {id,reviewId} = req.params;
    await Menu.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash("delReview", "Review deleted successfully");
    res.redirect(`/provider/menu/${id}`);
};