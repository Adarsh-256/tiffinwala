
const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    provider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    menu: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    totalPrice: {
        type: Number,
        required: true
    },

    address: {
        type: String,
        required: true
    },

   

    status: {
        type: String,
        enum: [
            "Pending",
            "Accepted",
            "Delivered",
            "Cancelled"
        ],
        default: "Pending"
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Order", orderSchema);