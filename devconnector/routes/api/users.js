const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => {
    res.json({ msg: 'Users works' });
});

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', (req, res) => {

    // Parse the incoming request
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

module.exports = router;