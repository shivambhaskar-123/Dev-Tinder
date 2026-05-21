const express = require('express');
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignUpData, validateLoginApi } = require('../utils/validator');

const authRoutes = express.Router();

authRoutes.post('/signup', async (req, res) => {

    try {
        // First validation of data
        validateSignUpData(req.body);
        // second Encrypt the password

        const { firstName, lastName, email, password } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);
        console.log('passwordHAsh', passwordHash);
        const newUser = {
            // ...req.body,// NOTE  DO not send all data coming from request extract only which are necessary so that other jargons can be ignored it will ignored any way if it is not defined in our schema but for safe side we do this
            firstName,
            lastName,
            email,
            password: passwordHash
        }
        const user = new User(newUser);

        await user.save();
        res.send('User added Successfully!');
    } catch (err) {
        res.status(400).send("ERROR: " + err?.message);
    }


});

authRoutes.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body;
        validateLoginApi(req.body);

        // Check if user exists in database
        const userData = await User.findOne({ email: email });

        if (!userData) {
            throw new Error('Invalid credentials');
        }
        //now validate the password
        //NOTE isPasswordValid() method will be available on userData not User 
        const isValidPassword = userData.isPasswordValid(password);

        if (isValidPassword) {

            // const token = 'akdlaskdlakaADfsks?skmfksfslflss';

            // send jwt token if success
            const token = await userData.getJWT();
            res.cookie("token", token);
            res.send('Login successfull!');
        } else {
            throw new Error('Invalid credentials');
        }
    } catch (err) {
        res.status(400).send("ERROR: " + err?.message);
    }
});

authRoutes.post('/logout', async (req, res) => {
    try {
        res.clearCookie('token');
        res.send('Logout successful!');
    } catch (err) {
        res.status(400).send("ERROR: " + err?.message);
    }
})

module.exports = authRoutes