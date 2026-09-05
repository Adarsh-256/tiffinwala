const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  businessName: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model("Provider", providerSchema);