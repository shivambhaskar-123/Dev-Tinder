const express = require('express');

// create an express application
const app = express();
const connectDB = require('./config/database')

const User = require('./models/user');

// signup api

app.post('/signup', async (req, res) => {
    // Creating new instance of the USer model

    const user = new User({
        firstName: 'Bhaskar',
        lastName: 'Shivam',
        email: 'bhaskar@gmail.com',
        password: 'Abcd1234'
    });

    // User.save() will return a promise that is why we need to use await here so that is why this func will be async

    //NOTE whenever doing any db operation it is always recommended to do in try catch block

    try {
        await user.save();
        res.send('User added Successfully!');
    } catch (err) {
        res.status(400).send("Error saving the data" + err?.message);
    }


})

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


