const mongoose = require('mongoose');

// connecting to database is async operation
const connectionUrl = process.env.MONGO_URI
const connectDB = async () => {
    await mongoose.connect(connectionUrl);
};

module.exports = connectDB;