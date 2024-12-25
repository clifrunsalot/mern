/**
 * This file contains the routes and custom logic for the profile actions.
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

// Adds mongoose functionality
const mongoose = require('mongoose');

// Adds passport functionality
const passport = require('passport');

//////////////
//          // 
// DATABASE //
//          //
//////////////

// This model will be used to create, read, update, and delete users.
const User = require('../../models/User');

// This model will be used to create, read, update, and delete profiles.
const Profile = require('../../models/Profile');

////////////////////
//                // 
// ROUTE HANDLING //
//                //
////////////////////

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => {
    res.json({ msg: 'Profile works' });
});

// @route   GET api/profile
// @desc    Get current user's profile. This endpoint will only be available to authenticated users.
//         The user's id is stored in the token, so we can use that to find the profile.
// @access  Private
route.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {};

    // Parse the incoming request
    // 'Profile' refers to the model, aka the collection called 'profile' in the database.
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            if (!profile) {
                errors.noProfile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});

module.exports = router;
