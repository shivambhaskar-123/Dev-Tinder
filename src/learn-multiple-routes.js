const express = require('express');

// create an express application
const app = express();

// ------------------ Multiple route handler examples ------------------

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
    (req, res) => {
        res.send('multi: final response');
    }
);

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
        // No further res.send() here, or Express will error because headers are already sent.
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
app.use((err, req, res, next) => {
    console.error('Error middleware:', err.message);
    res.status(500).send('Error caught: ' + err.message);
});

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
        next('route');
    },
    (req, res) => {
        // This handler is skipped because next('route') transfers control to the next matching route.
        res.send('skip: this will not be sent');
    }
);

app.get('/skip', (req, res) => {
    res.send('skip: second route handler after next("route")');
});

// 8) Example of a middleware chain where one handler detects a problem and aborts with a response
app.get('/auth-example',
    (req, res, next) => {
        const authorized = false;
        if (!authorized) {
            return res.status(401).send('auth-example: unauthorized');
        }
        next();
    },
    (req, res) => {
        res.send('auth-example: user is authorized');
    }
);

app.listen(3000, () => {
    console.log('Our server successfully listening on port 3000');
});

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
