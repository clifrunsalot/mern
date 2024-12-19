/**
 * This is the entry point of the application.
 * This module does the following:
 * 1. Imports the necessary modules to run the application.
 * 2. Connects to the database.
 * 3. Configures the server to listen on port 5000.
 * 4. Uses body-parser to parse incoming requests.
 * 5. Uses passport to authenticate requests.
 * 6. Routes requests to the appropriate route.
 */

/////////////
//         // 
// IMPORTS //
//         //
/////////////

// express Framework 
const express = require('express');

// mongoose for DB interaction 
const mongoose = require('mongoose');

// body-parser for parsing incoming requests
const bodyParser = require('body-parser');

// passport for authenticating requests
const passport = require('passport');

//////////////
//          // 
// DATABASE //
//          //
//////////////

// Imports database configuration
const db = require('./config/keys').mongoURI;

// Connects to database
mongoose.connect(db)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

/////////////
//         // 
// express //
//         //
/////////////

// Creates an instance
const app = express();

////////////////
//            // 
// body-parse //
//            //
////////////////

// Instructs app to use body-parser 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//////////////
//          // 
// passport //
//          //
//////////////

// Instructs app to use passport 
app.use(passport.initialize());

// Configures passport to authenticate requests
// The logic for this is in config/passport.js 
require('./config/passport')(passport);

////////////
//        // 
// ROUTES //
//        //
////////////

// Route abstractions 
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
const users = require('./routes/api/users');

// Routes requests to the appropriate endpoint 
app.use('/api/profile', profile);
app.use('/api/posts', posts);
app.use('/api/users', users);

////////////
//        // 
// SERVER //
//        //
////////////

// Sets up server to listen on port 5000
const port = process.env.PORT || 5000;

// Starts the server
app.listen(port, () => { console.log(`Server  is running on port ${port}`) });
