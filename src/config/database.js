const mongoose = require('mongoose');

// connecting to database is async operation
const connectionUrl = `abc.url.com`
const connectDB = async () => {
    await mongoose.connect(connectionUrl);
};

module.exports = connectDB;