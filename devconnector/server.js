
// Importing express to use framework
const express = require('express');

// Importing mongoose to connect to the database
const mongoose = require('mongoose');

// Route definitions
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');
const users = require('./routes/api/users');

// Importing the database configuration
const db = require('./config/keys').mongoURI;

// Connecting to the database
mongoose.connect(db)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Creating an instance of express
const app = express();

// Creating a route to get the home page
app.get('/', (req, res) => {
    res.send('Hello Jean');
});

// Route requests to the appropriate route
app.use('/api/profile', profile);
app.use('/api/posts', posts);
app.use('/api/users', users);

// Setting up the server to listen on port 5000
const port = process.env.PORT || 5000;

// Starting the server
app.listen(port, () => { console.log(`Server  is running on port ${port}`) });
