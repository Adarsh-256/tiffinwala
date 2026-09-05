const mongoose = require('mongoose');
const initData = require('./data.js');
const Menu = require('../models/menu.js');
const User = require('../models/user.js');

const MONGO_URL = "mongodb://127.0.0.1:27017/RoomRENT";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("connected to mongoDB");
}
main();
