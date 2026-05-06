const express = require('express');

// create an express application
const app = express();

const { adminAuth, userAuth } = require('./middlewares/auth')


// handle auth middleware for all the GET, POST.....requests
// app.use because it will handle all type of method request
app.use("/admin", adminAuth);

app.get('/admin/all-data', (req, res) => {
    res.send('Admin all data send');
});

app.delete('/admin/delete-user', (req, res) => {
    res.send('User deleted');
});

// As this use login req does need to be authenticated so no auth middleware
app.post('/user/login', (req, res) => {
    res.send('User logged In');
})
// req will first go through the userAuth middleware then to the request handler
app.get('/user', userAuth, (req, res) => {
    res.send('User all data send');
});

app.listen(3000, () => {
    console.log('Our server successfully listening on port 3000');
});

// Now we have created the web server
