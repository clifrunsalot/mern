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

// @route   GET api/profile/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => {
    res.json({ msg: 'Profile works' });
});

// @route   POST api/profile/all
// @desc    Get all profiles
// @access  Public
router.get('/all', (req, res) => {
    const errors = {};

    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles) {
                errors.noProfiles = 'There are no profiles';
                return res.status(404).json(errors);
            }

            res.json(profiles);
        })
        .catch(err => res.status(404).json({ profile: 'There are no profiles' }));

});

// @route   GET api/profile
// @desc    Get current user's profile. This endpoint will only be available to authenticated users.
//         The user's id is stored in the token, so we can use that to find the profile.
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    // Create an empty object to store any errors.
    const errors = {};

    // Parse the incoming request
    // 'Profile' refers to the model, aka the collection called 'profile' in the database.
    // The 'user' field in the profile collection is a reference to the 'User' collection. See the 
    // 'models/Profile.js' file, specifically the 'Profile.user' field. The 'findOne' method will
    // return the first profile that matches the query. The query is that the 'user' field in the
    // profile collection matches the 'id' field in the request.
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

// @route   POST api/profile
// @desc    Create or edit user profile. This endpoint will only be available to authenticated users.
// @access  Private    
router.post('/', passport.authenticate('jwt', { session: false }),
    (req, res) => {

        // Place the values in the incoming request into an object called profileFields. 
        const profileFields = {};

        // Set the user field in the profileFields object to the user id in the request.
        profileFields.user = req.user.id;

        // For each of the fields in the incoming request, add the field to the profileFields object.  
        if (req.body.handle) profileFields.handle = req.body.handle;
        if (req.body.company) profileFields.company = req.body.company;
        if (req.body.website) profileFields.website = req.body.website;
        if (req.body.location) profileFields.location = req.body.location;
        if (req.body.bio) profileFields.bio = req.body.bio;
        if (req.body.status) profileFields.status = req.body.status;
        if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;

        // Skills - split into array
        if (typeof req.body.skills !== 'undefined') {
            profileFields.skills = req.body.skills.split(',');
        }

        // Social
        // Keep in mind that the social field has subfields, but the incoming request only has the
        // top level fields. This means that the incoming request will have to be parsed to get the
        // subfields.
        profileFields.social = {};
        if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
        if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
        if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
        if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
        if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

    });

module.exports = router;
