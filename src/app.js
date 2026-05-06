const express = require('express');

// create an express application
const app = express();


// ***************  5. Multiple Route Handlers  *********************

// Multiple handlers for /multi
app.get('/multi-basic',
    (req, res, next) => {
        console.log('First handler');
        next(); // Pass control to the next handler
        //NOTE This function is with next() is actually called MIDDLEWARE
    },
    (req, res) => {
        res.send('Second handler');
    }
);



// 1) Normal chain: all handlers call next(), last handler sends the response
app.get('/multi',
    (req, res, next) => {
        console.log('multi: first handler');
        next();
    },
    (req, res, next) => {
        console.log('multi: second handler');
        next();
    },
    (req, res, next) => {
        next();
        console.log('multi: final response');
        res.send('multi: final response');
    }
);

/**
 *  (req, res, next) => {
        // next();
        console.log('multi: final response');
        // res.send('multi: final response');
    }
        if no res.send() and next()
 * Result: The request chain ends without sending a response. Express doesn't send a default 404 or close the connection—it just waits. The TCP connection stays open, so Postman keeps waiting until it times out (or you manually cancel).
 */

// If you call next() after res.send() (causes an error):
app.get('/multi-error',
    (req, res, next) => { console.log('multi-error: first handler'); next(); },
    (req, res, next) => {
        console.log('multi-error: second handler');
        next();
        res.send('multi-error: second handler');
    },
    (req, res, next) => {
        console.log('multi-error: final response');
        res.send('multi-error: final response');
    }
);

// NOTE this will give error "Cannot set headers after they are sent to the client" beacuse we are doing res.send againa after the response is send as the tcp connection is made and the response after that connection is over that is why

/*
Why the Error ?
    Once res.send() is called, Express commits the HTTP headers and response body to the client's TCP connection. You cannot send headers or another response on the same request. Any attempt to do so throws ERR_HTTP_HEADERS_SENT.


    Key Takeaway
Rule: Only call next() if you're NOT sending a response in that handler. If you send a response (res.send(), res.json(), etc.), either:

Don't call next(), OR
Use return res.send() to immediately exit the handler before next() is called

app.get('/multi-error',
    (req, res, next) => { console.log('multi-error: first handler'); next(); },
    (req, res, next) => {
        console.log('multi-error: second handler'); 
        return res.send('multi-error: second handler');  // return stops execution AND prevents next() effect
    },
    (req, res, next) => {
        console.log('multi-error: final response');
        res.send('multi-error: final response');
    }
);
*/

// 2) If every handler calls next() and no one sends a response, Express moves on.
// If there is no other matching route or middleware that sends a response, the request ends as 404.
app.get('/multi-no-send',
    (req, res, next) => {
        console.log('multi-no-send: first handler');
        next();
    },
    (req, res, next) => {
        console.log('multi-no-send: second handler');
        next();
    },
    (req, res, next) => {
        console.log('multi-no-send: third handler');
        next();
    }
);


// 3) Sending a response in one handler and then calling next()
// This is usually a mistake unless you purposely want to continue middleware after response.
app.get('/send-then-next',
    (req, res, next) => {
        res.send('send-then-next: response sent from first handler');
        next();
    },
    (req, res) => {
        console.log('send-then-next: second handler still runs after response');
        // No further res.send() here.
    }
);

// 4) Sending two responses in one route chain causes an error.
app.get('/send-twice',
    (req, res, next) => {
        res.send('send-twice: first response');
        next();
    },
    (req, res) => {
        console.log('send-twice: second handler trying to send again');
        res.send('send-twice: second response'); // Error: Can't set headers after they are sent.
    }
);


// 5) Error handling with next(err)
app.get('/error-route',
    (req, res, next) => {
        console.log('error-route: before error');
        next(new Error('Something went wrong inside this handler'));
    },
    (req, res) => {
        // This handler is skipped because next(err) jumps to error middleware
        res.send('This will not run');
    }
);

// Error-handling middleware must have 4 arguments: (err, req, res, next)
// (If 4 Arg passed) 1st arg-> act as err , 2nd -> req , 3rd-> res , 4t -> next
// (If 3 Arg passed) 1st arg-> act as req , 2nd -> res , 3rd-> next
// (If 2 Arg passed) 1st arg-> act as req , 2nd -> res
app.use((err, req, res, next) => {
    console.error('Error middleware:', err.message);
    res.status(500).send('Error caught: ' + err.message);
});

// app.use will act as here gloabl error catch handler

// 6) Using app.use() with a path and multiple handler functions / arrays
const logRequest = (req, res, next) => {
    console.log('app.use /route logRequest');
    next();
};

const addHeader = (req, res, next) => {
    res.set('X-Custom-Header', 'DevTinder');
    next();
};

const finalRouteHandler = (req, res) => {
    res.send('app.use /route final response');
};

app.use('/route',
    logRequest,
    [addHeader, (req, res, next) => {
        console.log('app.use /route inline middleware');
        next();
    }],
    finalRouteHandler
);

// 7) next('route') skips the remaining handlers for the current route

app.get('/skip',
    (req, res, next) => {
        console.log('skip: first handler');
        next('route'); // Skip to the next route handler, skipping any remaining handlers for this route
        /**
         * NOTE next('route') is special: It skips all remaining handlers in the current route definition (so the second handler in this route never runs) and immediately jumps to the next route definition that matches the same path (/skip).
         */
    },
    (req, res) => {
        // This handler is skipped because next('route') transfers control to the next matching route.
        res.send('skip: this will not be sent');
    }
)
/**
 * Express allows it: You can define multiple app.get('/skip', ...) (or any HTTP method) with the exact same path. They don't "overwrite" each other—instead, they stack in the order you define them in your code.
Processing order: When a request hits /skip, Express checks each matching route in sequence:
First /skip route (with two handlers).
Second /skip route (with one handler).

------------------------------------------------------
 * Purpose of next('route'): It's designed for this scenario. It lets you conditionally skip handlers within one route and "fall through" to the next route with the same path. Common use cases:
Conditional skipping: E.g., if authentication fails in the first handler, call next('route') to skip to a fallback route.
Route-level logic: Split logic across multiple route definitions for the same path without using arrays of handlers.
 */

app.get('/skip', (req, res) => {
    res.send('skip: second route handler after next("route")');
});

// 8) Example of a middleware chain where one handler detects a problem and aborts with a response

app.get('/auth-example',
    (req, res, next) => {
        const authorized = true; // Simulate an unauthorized user
        if (!authorized) {
            return res.status(401).send('auth-example: unauthorized'); // send the response exit the handler as we have used return;
        }
        next();
    },
    (req, res) => {
        res.send('auth-example: user is authorized');
    }
)

/*
Explanation summary:
- next() passes control to the next handler in the same route or middleware chain.
- If every handler calls next() without sending a response, Express will continue searching for the next matching route and may eventually return a 404.
- res.send() ends the response, so calling next() afterward is usually wrong unless the following middleware only logs, cleans up, or performs non-response work.
- Calling res.send() a second time causes an error because the response is already finished.
- next(err) jumps to error-handling middleware.
- app.use('/route', h1, [h2, h3], h4) is valid. Express flattens arrays and executes handlers in order.
- next('route') skips the remaining handlers in the current route and moves to the next matching route definition.
*/


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
