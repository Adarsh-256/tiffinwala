const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose").default;


const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },

  phone: String,
  address: String,
  role: {
    type: String,
    enum: ["customer", "provider"],
    default: "customer",
  },
});


// console.log(passportLocalMongoose);
// console.log(typeof passportLocalMongoose);
userSchema.plugin(passportLocalMongoose);


module.exports = mongoose.model("User", userSchema);