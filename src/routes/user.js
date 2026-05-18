
const express = require('express');
const User = require("../models/user");
const { userAuth } = require('../middlewares/auth');

const userRoutes = express.Router();

userRoutes.get('/profile', userAuth, async (req, res) => {
    try {

        // get user coming from  userAuth middleware
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(400).send("ERROR: " + err?.message);
    }
});

userRoutes.get('/user', async (req, res) => {
    const userEmail = req.body;
    try {
        const user = await User.find({ email: userEmail.email })
        if (user.length === 0) {
            res.status(404).send('User not found')
        } else {
            res.send(user);
        }
    } catch (err) {
        res.status(400).send("Something went wrong");
    }
});

module.exports = userRoutes;