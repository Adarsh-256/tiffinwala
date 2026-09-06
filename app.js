require("dotenv").config();
// console.log("SECRET =", process.env.SECRET);

const express= require("express");
const app = express();
const path = require("path");
const mongoose = require ("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapasync = require("./utiles/asyncwrap.js");
const ExpressError = require("./utiles/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { isLoggedIn, isOwner, isreviewAuthor } = require("./middleware.js");
const { saveredirectUrl } = require ("./middleware.js");
const homecontrollers = require("./controllers/home.js");
const usercontrollers = require("./controllers/user.js");
const menucontrollers = require("./controllers/menu.js");
const reviewcontrollers = require("./controllers/review.js");
const { validateMenu, validateReview } = require("./middleware.js");

const bcrypt = require("bcrypt");
// Image upload karne ke liye multer and cloudinary
const multer= require("multer");
const { storage } = require ("./cloudinaryconfig.js");
const upload = multer({ storage });
const Menu = require ("./models/menu.js");
const { appendFile } = require("fs/promises");

 const dbUrl = process.env.ATLASDB_URL;

// console.log("dbUrl", dbUrl);


//to apply bolierplate to all the ejs files
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));                 
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.engine("ejs",ejsMate);


const store = MongoStore.create({
    mongoUrl:dbUrl,
    crypto: {
        secret:process.env.SECRET,
    },
    touchAfter: 24*3600,
});
store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

// cookies in session
const sessionOptions={
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7* 24 * 60 * 60 * 1000, //7 days 24 hours 60 min 60 sec 1000 ms
        maxAge: 7* 24 * 60* 60 * 1000,
        httptype:true,
}};
// console.log(process.env.SECRET);
app.use(require("express-session")(sessionOptions));

app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

//to connect mongoDB 
main()
.then(()=>{
    console.log("connected to mongoDB");
}).catch((err)=>{
    console.log("error connecting to mongoDB", err); 
});
async function main(){  
    await mongoose.connect(dbUrl);
}; 

app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});
// Flash messages + authentication 
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Har EJS file me access karne ke liye currUser variable
app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});



//home
app.get("/", homecontrollers.home);

app.get("/testdata", async (req, res) => {
  const newMenu = new Menu({
    title: "Dal Roti",
    description: "Ghar jaisa khana",
    price: 120,
    category: "Veg",
    image: {
      url: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d",
      filename: "testimg"
    }
  });

  await newMenu.save();
  res.send("Test data inserted");
});

//search
app.get("/search", homecontrollers.searchbar);



//signup route
app.get("/signup",usercontrollers.signup);
app.post("/signup",usercontrollers.signupPost);

//login route
app.get("/login",usercontrollers.login);
app.post("/login",saveredirectUrl,usercontrollers.loginPost);


//logout route
app.get("/logout",homecontrollers.logout);

//index Route
app.get("/provider/index",menucontrollers.menuindex);


//Create  NEWRoute
app.get("/provider/create",isLoggedIn, menucontrollers.newMenuForm);

app.post("/provider/create",isLoggedIn,upload.single("menu[image]"),validateMenu, menucontrollers.createMenu);

//show route
app.get("/provider/menu/:id",menucontrollers.showMenu);
app.get("/menu/:id",menucontrollers.showMenu);

// provider
app.get("/provider/index", isLoggedIn, menucontrollers.providerIndex); 

// user
app.get("/user/index", isLoggedIn, menucontrollers.userIndex);


//Edit Route
app.get("/provider/menu/:id/edit",isLoggedIn,isOwner, menucontrollers.editMenuForm);

//update Route  
app.put("/provider/menu/:id",isLoggedIn,isOwner,upload.single("menu[image]"),validateMenu,menucontrollers.updateMenu);

//delete route               
app.delete("/provider/menu/:id",isLoggedIn,isOwner,menucontrollers.deleteMenu);

//Reviews-post Route
app.post("/provider/menu/:id",validateReview,reviewcontrollers.postReview);

//delete review route
app.delete("/provider/menu/:id/reviews/:reviewId",isLoggedIn,isreviewAuthor,reviewcontrollers.deleteReview);


//order route
app.get("/provider/menu/:id/order",isLoggedIn,menucontrollers.orderMenu); 

app.get("/provider/menu/:id/order/confirm",isLoggedIn,menucontrollers.confirmOrder);

app.post("/provider/menu/:id/order",isLoggedIn,menucontrollers.placeOrder);

app.post("/provider/menu/:id/order/confirm",isLoggedIn,menucontrollers.confirmOrderPost);

app.post("/provider/menu/:id/order/accept",isLoggedIn,menucontrollers.acceptOrder);

app.post("/provider/menu/:id/order/deliver",isLoggedIn,menucontrollers.deliverOrder);

app.get("/users/index",(req,res)=>{
    res.render("user/dashboard");
});

app.get("/providers/index",(req,res)=>{
    res.render("provider/index");
});

function isProvider(req,res,next){
    if(
        req.isAuthenticated() &&
        req.user.role==="provider"
    ){
        return next();

    }
    console.log(req.user);

    res.redirect("/login");
}

app.get(
    "/provider/index",
    isProvider,
    (req,res)=>{
        res.render("provider/index");
});

function isUser(req,res,next){
    if(
        req.isAuthenticated() &&
        req.user.role==="user"
    ){
        return next();
    }
    res.redirect("/login");
}
app.get(
    "/user/dashboard",
    isUser,
    (req,res)=>{
        res.render("user/dashboard");
});


app.listen (8080,()=>{
    console.log("Server is running on port 8080");
});

//to handle error 
app.all(/.*/,(req,res,next)=>{
  next(new ExpressError(404, " 404,Page not found!"));
});


// handle total error in one place
app.use((err, req, res, next) => {
       console.log(req.method, req.originalUrl);
    console.error(err); 
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error", { errMsg: message, statusCode });
});


