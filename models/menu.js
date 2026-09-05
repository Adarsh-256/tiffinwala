const { required } = require("joi");
const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  title:{
    type: String, required: true
  },
  description: String,

  // ✅ Fix: image should be an object, not a string
  image: {
        url: String,
        filename:String,
  },

  price: Number,
  createdAt:{
    type:Date,
    default:Date.now
  },
  
  reviews:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  category:{
    type:String,
    required:true,
    enum:["veg","non-veg"]

   
  }
});

const Menu = mongoose.model("Menu", menuSchema);
module.exports = Menu;


