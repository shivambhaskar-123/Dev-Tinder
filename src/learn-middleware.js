const express = require('express');
const app = express();

/**
 *NOTE  Suppose yiu are sending the request to express server try to go one by one to all the route handler in the order and check all these methods whaever is matching there and if its find its matching url and will go in that route handler "middlewares" till it reaches the function which actually send the response back and actually that function is known as request handler and all the functions that it goes through in between is known as MIDDLEWARES.
 * 
 * GET /users  => middlewares chanin => request handler
 */

/**
 * 
 * Middleware: Any function that sits between the incoming request and the final response. It can perform tasks like logging, authentication, parsing data, error handling, or modifying the request/response before passing it along.
Purpose: To modularize your code, reuse logic across routes, and handle cross-cutting concerns (e.g., security, logging) without cluttering individual route handlers.
Execution: Middleware runs in the order it's defined. Each can choose to:
Modify req or res.
Send a response (ending the cycle).
Call next() to pass to the next middleware.
Throw an error or call next(err) for error handling.


NOTE What Function Is Called Middleware?
Any function with the signature (req, res, next) => { ... } is considered middleware.
 */


// ------------------ Middleware Examples ------------------

/**
 * Middleware: Functions that execute during the request-response cycle.
 * Signature: (req, res, next) => { ... }
 * Can modify req/res, send response, or call next() to pass control.
 */

// 1. Built-in Middleware: express.json() - Parses JSON in request body
app.use(express.json());

// 2. Custom Logging Middleware: Logs every request
const loggerMiddleware = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();  // Pass to next middleware
};
app.use(loggerMiddleware);  // Applied to ALL routes

// 3. Authentication Middleware: Simulates checking for a token
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token || token !== 'secret-token') {
        return res.status(401).send('Unauthorized: Invalid token');
    }
    console.log('Auth passed');
    next();
};

// 4. Request Time Middleware: Adds timestamp to req object
const requestTimeMiddleware = (req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
};

// 5. Error-Handling Middleware: Catches errors from next(err)
const errorHandlerMiddleware = (err, req, res, next) => {
    console.error('Error caught:', err.message);
    res.status(500).send(`Server Error: ${err.message}`);
};

// Routes using middleware

// Public route: No auth required
app.get('/', (req, res) => {
    res.send(`Welcome! Request time: ${req.requestTime}`);
});

// Protected route: Uses authMiddleware
app.get('/protected', authMiddleware, requestTimeMiddleware, (req, res) => {
    res.send(`Protected content accessed at ${req.requestTime}`);
});

// Route with multiple middleware in array
app.get('/multi-middleware', [loggerMiddleware, requestTimeMiddleware], (req, res) => {
    res.send(`Multi-middleware route: ${req.requestTime}`);
});

// Route that triggers error
app.get('/error', (req, res, next) => {
    next(new Error('Simulated error in route'));
});

// Apply error handler at the end (must be last)
app.use(errorHandlerMiddleware);

app.listen(3000, () => {
    console.log('Middleware examples running on port 3000');
});

/*
Key Notes:
- Middleware order: app.use() runs before routes; define error handlers last.
- next(): Passes control; next(err) jumps to error middleware.
- Built-in vs. Custom: Express provides some (e.g., json()), but most are custom.
- Not all functions are middleware: Only those in the request pipeline(e.g., via app.use(), app.get(), etc.) qualify.
- Order matters: Define middleware before routes that need it
- Test in Postman:
  - GET / → Public, logs request.
  - GET /protected (add header: Authorization: secret-token) → Auth required.
  - GET /multi-middleware → Shows multiple middleware execution.
  - GET /error → Triggers error handler.
*/