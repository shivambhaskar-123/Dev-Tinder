const express = require('express');

// create an express application
const app = express();


app.get('/user/data', (req, res) => {
    throw new Error('Something went wrong while fetching user data');
})

// Error handling using try catch which is the best way when doing any db call or others
app.get('/user/data2', (req, res) => {
    try {
        // some code here
        throw new Error('Something went wrong while fetching in try block');
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
})

// Error handling using middleware it will match all routes as wild card

app.use('/', (err, req, res, next) => {
    if (err) {
        res.status(500).send('Error: ' + err.message);
    }
})

app.listen(3000, () => {
    console.log('Our server successfully listening on port 3000');
});

// Now we have created the web server
