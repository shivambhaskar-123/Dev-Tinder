
const express = require('express');
const User = require("../models/user");
const { userAuth } = require('../middlewares/auth');
const { validateProfileEditData } = require('../utils/validator')

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

userRoutes.patch('/profile/edit/:id', userAuth, async (req, res) => {
    try {
        validateProfileEditData(req.body);
        // as we are using userAuth it will return us the valid user
        const loggedInUser = req.user;
        // check if id in params is same as logged in user id
        if (loggedInUser._id != req.params.id) {
            throw new Error('Not authorized to make changes');
        }
        // console.log('loggedInUser', loggedInUser);

        Object.keys(loggedInUser).forEach(field => {
            // console.log('field', field);
            //NOTE DO NOT USE THIS as it is mongoos internal doc and Object.keys(loggedInUser) — that includes Mongoose internals like $__, $isNew, and _doc.

        });

        //Use  Object.keys(req.body)
        Object.keys(req.body).forEach(field => {
            loggedInUser[field] = req.body[field];
        })
        await loggedInUser.save();

        // if wants to send data in form of json
        res.json({
            message:
                'Profile updated successfully',
            data: loggedInUser.toPublicProfile()
        })


    } catch (err) {
        res.status(400).send("ERROR: " + err?.message);
    }
})

/***
 * Mongoose will run schema validation automatically on save(). That means your schema-level validators will apply, including:

required
minlength / maxlength
enum
min / max
custom validate(...)
URL / email / password-strength checks in your schema
What this means
save() validates the document before writing
all schema validators are checked
your custom validateProfileEditData is an extra guard, but the schema still protects the final save

Important nuance
save() validates document state, not only changed fields
default values are only applied on new documents, not on an existing loaded document
unknown fields are not saved by default because Mongoose schema strict mode is on by default
 */

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