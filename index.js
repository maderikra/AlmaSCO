const express = require("express");
require("dotenv").config();
const app = express();
const PORT = 3007;
const appConfig = require('./config/config'); 
const bodyParser = require("body-parser");
const authRoute = require('./routes/auth');
const checkoutRoute = require('./routes/checkout');
const patronRoute = require('./routes/patron');
const logoutRoute = require('./routes/logout');

//required to manage user sessions
const session = require("express-session");

const maxInactiveAge = appConfig.inactivityTimeout * 1000 * 60; 
const absoluteMaxAge = 20 * 60 * 1000; // 20 minutes

app.use(
    session({
      secret: "this is my secret there are many like it", // Replace with a strong secret in production
      resave: false,
      saveUninitialized: true,
      cookie: { 
        secure: false, // Set secure: true if using HTTPS
        maxAge: absoluteMaxAge, //set max session length
     }, 
    })
  );

  // Middleware to check last action time and reset cookie
app.use((req, res, next) => {
    const now = new Date().getTime();
    req.session.lastAction = req.session.lastAction || now; // Initialize if not set
    const timeSinceLastAction = now - req.session.lastAction;
  
    if (timeSinceLastAction > maxInactiveAge) {
      // Too much inactivity, destroy the session
      return req.session.destroy(() => res.clearCookie('connect.sid').redirect('/'));
    }
    // Reset the last action time
    req.session.lastAction = now;
  
    // Reset the cookie maxAge every time the user interacts
    req.session.cookie.maxAge = absoluteMaxAge;
    next();
  });

// Middleware to serve static files
app.use(express.json());
app.use(express.static("public"));

// Middleware for parsing POST data
app.use(bodyParser.urlencoded({ extended: true }));

app.locals.baseURL = appConfig.baseUrl;
app.use('/', authRoute);
app.use('/', checkoutRoute);
app.use('/', patronRoute);
app.use('/', logoutRoute);






  app.set("view engine", "ejs");


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
