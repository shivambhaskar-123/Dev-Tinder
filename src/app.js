const express = require('express');

// create an express application
const app = express();
const connectDB = require('./config/database')

const User = require('./models/user');

// 1. Built-in Middleware: express.json() - Parses JSON in request body
/**
 * It reads the JSON object converts it into a javascript object and its add that javascript object back to all of the request object in the body as app.use will work for all the routes if we do not use it then we will se req.body will print undefined.
 */
app.use(express.json());

app.post('/signup', async (req, res) => {
    // Creating new instance of the USer model
    // console.log(req.body);
    const user = new User(req.body);

    // User.save() will return a promise that is why we need to use await here so that is why this func will be async

    //NOTE whenever doing any db operation it is always recommended to do in try catch block

    try {
        await user.save();
        res.send('User added Successfully!');
    } catch (err) {
        res.status(400).send("Error saving the data" + err?.message);
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
        const user = await User.findByIdAndUpdate(req.body.id, req.body, { returnDocument: 'after' });
        res.send({ ...user, message: 'Update Successfull' });
    } catch (err) {
        res.status(400).send("Something went wrong" + err?.message);
    }
})

// UPDATE USER BY EMAIL FIND

app.put('/user/update', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate({ email: req.body.email }, req.body, { returnDocument: 'after' });
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


