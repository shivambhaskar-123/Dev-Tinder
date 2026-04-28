const express = require('express');

// create an express application
const app = express();

// to hande in coming request and send response

/** /hello or /hello/xyz or /hello/abcd/1324 */

app.use('/hello', (req, res) => {
    res.send('hello hello hello......');
});

app.use('/test', (req, res) => {
    res.send('Welcome to test server..');
});

/** below is kind of WILDCARD route handler anything after '/' it will handle that */
app.use('/', (req, res) => {
    res.send('Welcome to dashboard');
});

// we need to listen this app on some port

app.listen(3000, () => {
    console.log('Our server successfully listening on port 3000');
});

// Now we have created the web server
