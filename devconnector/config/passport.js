
// Importing passport-jwt to authenticate requests
const JwtStrategy = require('passport-jwt').Strategy;

// Importing functionality to extract the token from the request 
const ExtractJwt = require('passport-jwt').ExtractJwt;

// Importing mongoose to interact with the database
const mongoose = require('mongoose');

// Load User model
// 'User' refers to the model, aka the collection called 'users' in the database.
const User = require('../models/User');

// Importing the keys to be used in the app
const keys = require('./keys');

// Importing passport to authenticate requests
const passport = require('passport');

// Options for the passport-jwt strategy
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: keys.secretOrKey
}

// Exporting the passport configuration
module.exports = passport => {

    // Using the passport-jwt strategy to authenticate requests
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {

        // Find the user by the id in the payload
        User.findById(jwt_payload.id)
            .then(user => {

                // If the user is found
                if (user) {

                    // Return the user
                    return done(null, user);
                }

                // If the user is not found
                // Return false
                return done(null, false);
            })
            .catch(err => {
                console.log(err);

            })
    })
    )
};
