// app.js — first line, before every other require
require("dotenv").config();

const express = require('express');
// create an express application
const app = express();
const connectDB = require('./config/database')

const bcrypt = require("bcrypt")
const cookieParser = require('cookie-parser');
const routes = require('./routes/index');

app.use(express.json());

app.use(cookieParser());

// ── routes ────────────────────────────────────────
app.use('/', routes);   // all routes go through master router


/**
 * NOTE As we should always listen to server after we have established a happy connection with our database or other wise what will happen request will start to come and then later in few time we will established the connection and some request may be remain unanswered.
 */

// connectDB return a promise.
connectDB().then(() => {
    console.log('Database connection established');
    // after this we should listen to server
    app.listen(process.env.PORT, () => {
        console.log('Our server successfully listening on port 3000');
    });

})
    .catch((err) => {
        console.error('Failed to connect with database', err);
    });


