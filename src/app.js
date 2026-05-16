// app.js — first line, before every other require
require("dotenv").config();

const express = require('express');
// create an express application
const app = express();
const connectDB = require('./config/database')

const User = require('./models/user');
const { validateSignUpData, validateLoginApi } = require('./utils/validator');
const bcrypt = require("bcrypt")
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth")
// 1. Built-in Middleware: express.json() - Parses JSON in request body
/**
 * It reads the JSON object converts it into a javascript object and its add that javascript object back to all of the request object in the body as app.use will work for all the routes if we do not use it then we will se req.body will print undefined.
 */
app.use(express.json());

app.use(cookieParser());

app.post('/signup', async (req, res) => {

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

app.post('/login', async (req, res) => {

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
            const token = userData.getJWT();
            res.cookie("token", token);
            res.send('Login successfull!');
        } else {
            throw new Error('Invalid credentials');
        }
    } catch (err) {
        res.status(400).send("ERROR: " + err?.message);
    }
});

// PROFILE API

app.get('/profile', userAuth, async (req, res) => {
    try {

        // get user coming from  userAuth middleware
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(400).send("ERROR: " + err?.message);
    }
});

app.get('/user', async (req, res) => {
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

// FIND ONE USER
app.get('/user/single', async (req, res) => {
    console.log(req.body)
    const userEmail = req.body.email;
    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).send('User not found');
        } else {
            res.send(user);
        }
    } catch (err) {
        res.status(400).send("Something went wrong");
    }
});

/**
 * When you have duplicate emails in your DB and call User.findOne(), Mongoose (MongoDB) always returns the first document inserted — i.e., the one with the lowest _id (which encodes insertion timestamp).
 */

// GET USER BY ID

app.get('/user/id', async (req, res) => {
    // console.log(req.body)
    const userId = req.body.id;
    try {
        const user = await User.findById({ _id: userId });
        if (!user) {
            return res.status(404).send('User not found');
        } else {
            res.send(user);
        }
    } catch (err) {
        res.status(400).send("Something went wrong" + err.message);
    }
});

// API TO GET ALL THE USER from the database

app.get('/feed', async (req, res) => {
    try {
        const user = await User.find({});
        res.send(user);
    } catch (err) {
        res.status(400).send("Something went wrong");
    }
});

// API TO DELETE A USER

app.delete('/user', async (req, res) => {
    try {
        // await User.findByIdAndDelete(req.body.id);
        await User.findByIdAndDelete({ _id: req.body.id }); // both are same 100 and 101
        res.send('USer deleted Successfully');
    } catch (err) {
        res.status(400).send("Something went wrong");
    }
});

app.put('/user', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.body.id, req.body,
            {
                new: true,
                overwrite: true,       // ← makes it a true replace
                runValidators: true,
                // returnDocument: 'after' // ← driver style,
            }
        );
        res.send({ ...user, message: 'Update Successfull' });
    } catch (err) {
        res.status(400).send("Something went wrong" + err?.message);
    }
})

// USE OF REPLACE ONE

app.put('/user/update-by-replace-one', async (req, res) => {
    try {
        const { id, ...rest } = req.body; // separate id from fields

        const result = await User.replaceOne(
            { _id: id },   // find by this
            rest,          // replace entire document with this
            { runValidators: true }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send('User not found');
        }

        // replaceOne doesn't return the doc, fetch it manually
        const updatedUser = await User.findById(id);
        res.send({ ...updatedUser.toObject(), message: 'Update Successful' });

    } catch (err) {
        res.status(400).send("Something went wrong: " + err?.message);
    }
});

// UPDATE USER BY EMAIL FIND

app.put('/user/update', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate({ email: req.body.email }, req.body, { returnDocument: 'after' });
        res.send({ ...user, message: 'Update Successfull' });
    } catch (err) {
        res.status(400).send("Something went wrong" + err?.message);
    }
});

// UPDATE API FOR PRODUCTION READY APPLICATION

app.patch('/user-update-industry-standard-way-one/:id', async (req, res) => {
    try {
        const ALLOWED_UPDATES = ['firstName', 'lastName', 'age', 'gender', 'photoUrl', 'about', 'password'];

        const requestedUpdates = Object.keys(req.body);
        const isValidOperation = requestedUpdates.every(key => ALLOWED_UPDATES.includes(key));

        if (!isValidOperation) {
            return res.status(400).send({ message: 'Invalid fields in update request' });
        }

        if (requestedUpdates.length === 0) {
            return res.status(400).send({ message: 'No fields provided to update' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            {
                new: true,
                runValidators: true,
                select: '-password',   // never send password back in response
                lean: true,            // plain object — faster, enough for sending response
            }
        );

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.status(200).send({ user, message: 'Update Successful' });

    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).send({ message: 'Email already in use' });
        }
        res.status(500).send({ message: 'Something went wrong: ' + err?.message });
    }
});

/********************************************************** */

app.patch('/user/:id', async (req, res) => {
    /**
     * // ✅ schema is the single source of truth
const ALLOWED_UPDATES = Object.keys(User.schema.paths).filter(field =>
    !['_id', '__v', 'createdAt', 'updatedAt'].includes(field)
);
// automatically gives you every field in schema
     */
    const BLOCKED_FIELDS = ['_id', '__v', 'createdAt', 'updatedAt', 'password'];

    const sanitizeUpdate = (body) => {
        const sanitized = { ...body };
        BLOCKED_FIELDS.forEach(field => delete sanitized[field]);
        return sanitized;
    }
    try {
        console.log(req.body);
        console.log('id===', req.params.id)
        const updateData = sanitizeUpdate(req.body);

        if (Object.keys(updateData).length === 0) {
            return res.status(400).send({ message: 'No valid fields to update!' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            {
                // new: true,
                returnDocument: 'after',
                runValidators: true,
                select: '-password',   // never send password back in response
                lean: true,            // plain object — faster, enough for sending response
            }
        );

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.status(200).send({ user, message: 'Update Successful' });
    }
    catch (err) {
        if (err.code === 11000) {
            return res.status(400).send({ message: 'Duplicate field value: ' + JSON.stringify(err.keyValue) });
        }
        res.status(500).send({ message: err?.message });
    }
})

/**
 * You're passing req.body directly into findByIdAndUpdate without overwrite: true or $set. This actually runs a merge by default in Mongoose, which means your PUT is silently behaving like a PATCH
 */

// PARTIAL UPDATE

app.patch('/user', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.body.id, req.body,
            {
                returnDocument: 'after',
                new: true,
                runValidators: true
            });
        console.log(user)
        res.send({ ...user, message: 'Update Successfull' });
    } catch (err) {
        res.status(400).send("Something went wrong" + err?.message);
    }
});


/**
 * NOTE Remember the nomenclature
 * devTinder => Is the database
 * User => Is the collection
 * And after the api we save this data {
        firstName: 'Bhaskar',
        lastName: 'Shivam',
        email: 'bhaskar@gmail.com',
        password: 'Abcd1234'
    } ==> This is called a one document inside the collection 
 * 
    Whenever we save this data a new _id is created inside the each document to uniqley indentify the document mongodb creates thus for us
 */










/**
 * NOTE As we should always listen to server after we have established a happy connection with our database or other wise what will happen request will start to come and then later in few time we will established the connection and some request may be remain unanswered.
 */

// connectDB return a promise.
connectDB().then(() => {
    console.log('Database connection established');
    // after this we should listen to server
    app.listen(3000, () => {
        console.log('Our server successfully listening on port 3000');
    });

})
    .catch((err) => {
        console.error('Failed to connect with database', err);
    });


