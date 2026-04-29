const express = require('express');

// create an express application
const app = express();

/** This will handle only get call to /user */
app.get('/user', (req, res) => {
    res.send({ name: 'Shivam', city: 'Uttar Pradesh' });
});

app.post('/user', async (req, res) => {
    console.log('body==', req.body);
    res.send("Data sucessfully saved to databasehghghg");
})

/** ? (Optional Character) */

// Matches /ab or /a
app.get('/ab?', (req, res) => {
    res.send('Matched route: /ab?');
});

/**          + (One or More)       */

// Matches /ab, /abb, /abbb, /abbbbbbbb but not /abbc etc.
app.get('/ab+', (req, res) => {
    res.send('Matched route: /ab+');
});

/**            * (Wildcard)           */

// Matches /abc, /abxyz, /abanything but not /acanything
app.get('/ab*', (req, res) => {
    res.send('Matched route: /ab*');
});


/**    () (Grouping)       */

// Matches /abcd or /acd 
app.get('/ab(cd)?', (req, res) => {
    res.send('Matched route: /ab(cd)?');
});

/***
 
Route: /ab(cd)?
The ? after (cd) means the group (cd) is optional.
So, the route matches:
/ab (without cd)
/abcd (with cd)
It does NOT match:

/abc (because only c is present, not cd)
/abd (because only d is present, not cd)
/abanythingelse
Why?
The pattern is:
/a + b + (optional cd)
Example Table
URL	Matches?	Why?
/ab	✅	cd is optional
/abcd	✅	cd is present
/abc	❌	Only c, not cd
/abd	❌	Only d, not cd
/abef	❌	Not cd

 */





/** 2.        Regex in Routes  /a/ (Contains 'a')   */

// Matches any path containing 'a'
app.get(/a/, (req, res) => {
    res.send('Matched route: /a/ (contains "a")');
});

/**     /.*fly$/ (Ends with 'fly') $ sign means end with fly       */

// Matches /butterfly, /dragonfly, etc.
app.get(/.*fly$/, (req, res) => {
    res.send('Matched route: ends with "fly"');
});


/**
 
/.*fly$/ is a regular expression (regex) used as a route path.
.* means zero or more of any character.
fly is the exact string it looks for.
$ means end of the string.
So:
This route matches any path that ends with "fly".

Examples
URL	Matches?	Why?
/butterfly	✅	Ends with "fly"
/dragonfly	✅	Ends with "fly"
/fly	✅	Ends with "fly"
/butterflies	❌	Does not end with "fly"
/flyer	❌	Does not end with "fly"


 */



// ***************** 4. Reading Dynamic Routes ***********************

// Example: /user/123  
app.get('/user/:id', (req, res) => {
    const userId = req.params.id;
    res.send(`Dynamic route - User ID: ${userId}`);
});



// ***************  5. Multiple Route Handlers  *********************

// Multiple handlers for /multi
app.get('/multi',
    (req, res, next) => {
        console.log('First handler');
        next(); // Pass control to the next handler
    },
    (req, res) => {
        res.send('Second handler');
    }
);

/**
 
Why use multiple handlers?
Separation of logic: You can split your logic into smaller steps.
Reusability: You can reuse handlers for different routes.
Pre-processing: Do something (like logging, authentication, etc.) before sending a response.


The first handler runs:

It logs 'First handler' to the console.
It calls next(), which tells Express to move to the next handler.
The second handler runs:



 */



app.listen(3000, () => {
    console.log('Our server successfully listening on port 3000');
});

// Now we have created the web server
