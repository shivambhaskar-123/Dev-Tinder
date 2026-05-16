const jwt = require("jsonwebtoken");
const User = require('../models/user');


const userAuth = async (req, res, next) => {
    // check token
    try {
        const { token } = req?.cookies;
        if (!token) {
            return res.status(401).send("Access Denied. Invalid token!!!.");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded?._id);

        if (!user) {
            throw new Error("User not found");
        }
        // pass user from here to the reqest so that it is not queried in database again where it is needed;
        req.user = user;
        next();
    }
    catch (err) {
        res.status(400).send("ERROR: " + err?.message);
    }

}
module.exports = { userAuth };