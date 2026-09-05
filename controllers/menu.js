const Menu = require("../models/menu");
const Order = require("../models/order");
const Provider = require("../models/provider");



module.exports.menuindex = async (req, res) => {
  const { category } = req.query;
  let allMenu;
  if (category) {
    allMenu = await Menu.find({ category });
  } else {
    allMenu = await Menu.find({});
  }
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const orders = await Order.find({
        provider: req.user._id,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        },
        status: {
            $in: ["Pending", "Accepted"]
        }
    })
    .populate("customer")
    .populate("menu")
    .sort({ price: -1 });

    const provider = await Provider.findOne({
    owner: req.user._id
  });
  res.render("./provider/index", { allMenu,  orders, owner: req.user, provider : provider });
};
 

module.exports.showMenu = async (req, res) => {
    let { id } = req.params;
    const menu = await Menu.findById(id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        });
    // console.log(menu.owner);
    if (!menu) {
        req.flash("error", "Menu not found!!");
        return res.redirect("/provider/index");
    }
    console.log(menu);
    
    res.render("provider/show", { menu });
};


module.exports.newMenuForm = (req,res)=>{
     res.render("provider/createMenu.ejs")
};


module.exports.createMenu = async(req,res,next) => {
    try {
        let url = req.file.path;
        let filename = req.file.filename;
        const newMenu = new Menu(req.body.menu);
        newMenu.category = req.body.menu.category;
        newMenu.owner = req.user._id;
        newMenu.image = { url, filename };
        console.log("newMenu:", newMenu);

        await newMenu.save();
        req.flash("success", "New Menu Created successfully !!");
        res.redirect("/provider/index");
    } catch (err) {
        next(err);
    }
};


// provider
module.exports.providerIndex = async (req, res) => {
    const allMenu = await Menu.find({ owner: req.user._id });
    res.render("provider/index", { allMenu });
};  


// customer
module.exports.userIndex = async (req, res) => {
    const allMenu = await Menu.find().populate("owner");
    const orders = (await Order.find({ customer: req.user._id }).populate("menu").populate("provider").sort({ price: -1 }));

    res.render("user/dashboard", { allMenu, orders ,    owner :  req.user });
 
};


module.exports.editMenuForm = async (req, res, next) => {
    let { id } = req.params;
    const menu = await Menu.findById(id);
    if (!menu) {
         req.flash("error", " Menu not found!!");
         res.redirect("/provider/index");
    }
    let originalImageUrl = menu.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_200,w_600");
    res.render("provider/edit.ejs", { menu, originalImageUrl }); 
};

module.exports.updateMenu = async (req, res) => {
    let { id } = req.params;

    let menu = await Menu.findById(id);
    menu.title = req.body.menu.title;
    menu.description = req.body.menu.description;
    menu.price = req.body.menu.price;
    menu.category = req.body.menu.category;

    //  Update image if provided
    if (req.file) {
        menu.image = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    await menu.save();

    req.flash("success", "Menu updated successfully");
    res.redirect(`/provider/index/`);
};

module.exports.deleteMenu = (async(req,res)=>{
    let {id} = req.params;
    let deletedmenu= await Menu.findByIdAndDelete(id);
    console.log(deletedmenu);
    req.flash("delMenus", "Menu deleted successfully");
    return res.redirect("/provider/index");
});

module.exports.acceptOrder = async (req, res) => {
    const { id } = req.params;
    const order = await Order.findOne({
        _id: id,
        provider: req.user._id
    });
    
    if(!order){
        req.flash("error", "Order not found!");
        return res.redirect("/provider/index");
    }
    order.status = "Accepted";
    await order.save();
    req.flash("success", "Order accepted!");
    res.redirect("/provider/index");
};

module.exports.deliverOrder = async (req, res) => {
    const { id } = req.params;
    const order = await Order.findOne({
        _id: id,
        provider: req.user._id
    });
    if (!order) {
        req.flash("error", "Order not found!");
        return res.redirect("/provider/index");
    }
    order.status = "Delivered";
    await order.save();
    req.flash("success", "Order marked as delivered!");
    res.redirect("/provider/index");
};

//order menu
module.exports.orderMenu = async (req, res) => {
    let { id } = req.params;
    const menu = await Menu.findById(id).populate("owner");
    if (!menu) {
        req.flash("error", "Menu not found!!");
        return res.redirect("/provider/index");
    }
    res.render("user/confirmOrder", { menu });
};

module.exports.placeOrder = async (req, res) => {
    let { id } = req.params;
    let { quantity, address } = req.body;
    const menu = await Menu.findById(id).populate("owner");
    if (!menu) {
        req.flash("error", "Menu not found!!");
        return res.redirect("/provider/index");
    }
    quantity = Number(quantity) || 1;
    const totalPrice = menu.price * quantity;
    console.log(totalPrice);
   const order = new Order({
        customer: req.user._id,
        provider: menu.owner._id,
        menu: menu._id,
        quantity: quantity,
        totalPrice: totalPrice,
        address: address,
        status: "Pending"
    });
    await order.save();
    console.log("ORDER SAVED:", order._id);
    res.render("user/payment", {
        menu,
        quantity: quantity,
        address,
        totalPrice,
        order
    });
};

module.exports.confirmOrder = async (req, res) => {
    let { id } = req.params;
    const menu = await Menu.findById(id).populate("owner");
    if (!menu) {
        req.flash("error", "Menu not found!!");
        return res.redirect("/provider/index");
    }
    res.render("user/confirmOrder", { menu });
};

module.exports.confirmOrderPost = async (req, res) => {
    let { id } = req.params;
    const menu = await Menu.findById(id).populate("owner");
    if (!menu) {
        req.flash("error", "Menu not found!!");
        return res.redirect("/provider/index");
    }
    req.flash("success", "Order placed successfully!");
    res.render("user/success");
}

