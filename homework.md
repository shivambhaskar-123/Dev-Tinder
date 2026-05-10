 # Difference between PATCH and PUT

GET    /users/:id        → fetch a user
POST   /users            → create a new user
PUT    /users/:id        → replace entire user (When sending all the fields in request body for update)
PATCH  /users/:id        → partial update (When sending only partial fields)
DELETE /users/:id        → delete a user