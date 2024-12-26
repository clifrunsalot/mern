/**
 * This file contains the routes and custom logic for the user actions.
 */

//////////////
//          // 
// IMPORTS  //
//          //
//////////////

// Adds express framework functionality
const express = require('express');

// Adds router functionality 
const router = express.Router();

// Adds image retrieval functionality 
const gravatar = require('gravatar');

// Adds password hashing functionality
const bcrypt = require('bcryptjs');

// Adds token creation functionality
const jwt = require('jsonwebtoken');

// Adds keys functionality
const keys = require('../../config/keys');

// Adds passport functionality
const passport = require('passport');

// Adds validation functionality
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

//////////////
//          // 
// DATABASE //
//          //
//////////////

// Loads User model.
// This model will be used to create, read, update, and delete users.
const User = require('../../models/User');

////////////////////
//                // 
// ROUTE HANDLING //
//                //
////////////////////

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => {
    res.json({ msg: 'Users works' });
});

// @route   POST api/users/register
// @desc    Use this route to register a user. The body of the request must contain:
//          name, email, and password of the user.
// @access  Public
router.post('/register', (req, res) => {

    // Validate the incoming request
    const { errors, isValid } = validateRegisterInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    // Parse the incoming request
    // 'User' refers to the model, aka the collection called 'users' in the database.
    User.findOne({ email: req.body.email })

        .then(user => {

            // Check if the email already exists
            if (user) {
                return res.status(400).json({ email: 'Email already exists' });

            } else {

                // Get the avatar from gravatar
                const avatar = gravatar.url(req.body.email, {
                    size: '200',
                    rating: 'pg',
                    default: 'mm'
                });

                // Create a new user
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password
                });

                // Process the password
                bcrypt.genSalt(10, (err, salt) => {

                    // Handle hashing the password
                    bcrypt.hash(newUser.password, salt, (err, hash) => {

                        // Check for errors
                        if (err) throw err;

                        // Set the password to the hash 
                        newUser.password = hash;

                        // Finally, save the user
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
});

// @route   POST api/users/login
// @desc    Use this to log in user. The body of the request must contain:
//          the email and password of the user. Values are case-sensitive. 
// @access  Public
router.post('/login', (req, res) => {

    let payload_token = '';

    // Validate the incoming request
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // Find the user by email
    // 'User' refers to the model, aka the collection called 'users' in the database.
    User.findOne({ email: email }).then(user => {

        // Check for user
        if (!user) {
            errors.email = 'User not found';
            return res.status(404).json({ errors });
        }

        // else check password
        bcrypt.compare(password, user.password).then(isMatch => {

            // If password is correct
            if (isMatch) {

                // Create JWT payload
                const payload = { id: user.id, name: user.name, avatar: user.avatar };

                // Sign the token
                jwt.sign(
                    payload,
                    keys.secretOrKey,
                    { expiresIn: 3600 },
                    (err, token) => {
                        payload_token = token;
                        res.json({
                            success: true,
                            token: 'Bearer ' + token
                        });
                    });

                // Send response
                res.json({
                    msg: 'Success',
                    // This will be used to authenticate the user
                    token: 'Bearer ' + payload_token
                });

            } else { // If password is incorrect

                // Send response 
                errors.password = 'Password incorrect';
                return res.status(400).json({ errors });
            }
        })
    });
});

// @route   GET api/users/current
// @desc    Returns current user. The meta data must be the following:
//          'Authorization' => Auth Type == Bearer Token
//          'Token' == "<token minus 'Bearer ' portion>"
//          The bearer token is generated when the user logs in. See the login route.
// @access  Private
router.get('/current', passport.authenticate(
    'jwt',
    { session: false }
),
    (req, res) => {

        // Send response, which is the user information
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        });
    }
);

module.exports = router;