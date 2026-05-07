const mongoose = require('mongoose');

// connecting to database is async operation
const connectionUrl = `mongodb+srv://bhaskar786shivam_db_user:j1lCsrhyAJlHZ1uk@cluster0.ouopehx.mongodb.net/devTinder`
const connectDB = async () => {
    await mongoose.connect(connectionUrl);
};

module.exports = connectDB;