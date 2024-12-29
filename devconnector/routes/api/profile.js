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

// Adds validation functionality
const validateProfileInput = require('../../validation/profile');
const validateEducationInput = require('../../validation/education');
const validateExperienceInput = require('../../validation/experience');

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
        .catch(err => res.status(404).json({ profiles: 'There are no profiles' }));

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
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noProfile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
});

// @route   GET api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get('/handle/:handle', (req, res) => {

    // Create an empty object to store any errors.
    const errors = {};

    // Parse the incoming request
    // The 'handle' field in the profile collection is unique. The 'findOne' method will
    // return the first profile that matches the query. The query is that the 'handle' field in the
    // profile collection matches the 'handle' field in the request.
    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noProfile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
})

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', (req, res) => {

    // Create an empty object to store any errors.
    const errors = {};

    // Parse the incoming request
    // The 'user' field in the profile collection is unique. The 'findOne' method will
    // return the first profile that matches the query. The query is that the 'user' field in the
    // profile collection matches the 'user_id' field in the request.
    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noProfile = 'There is no profile for this user';
                return res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404).json({ profile: 'There is no profile for this user' }));
});


// @route   POST api/profile
// @desc    Create or edit user profile. This endpoint will only be available to authenticated users.
// @access  Private    
router.post('/', passport.authenticate('jwt', { session: false }),
    (req, res) => {

        const { errors, isValid } = validateProfileInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

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
        // Keep in mind that the social, experience, and education have subfields.
        profileFields.social = {};
        if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
        if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
        if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
        if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
        if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

        // Experience
        // profileFields.experience = {};

        // Education
        // profileFields.education = {};

        // Find the profile by the user id in the request and update the profile with the profileFields object.
        Profile.findOne({ user: req.user.id })
            .then(profile => {

                // If the profile exists, update it.
                if (profile) {
                    Profile.findOneAndUpdate(
                        { user: req.user.id },
                        // Use MongoDB's '$set' operator to concisely set the profile fields. 
                        { $set: profileFields },
                        { new: true }
                    ).then(profile => res.json(profile));

                } else {
                    // Create a new profile
                    // TODO: Why is this necessary if the action is to create a new profile. 
                    Profile.findOne({ handle: profileFields.handle })
                        .then(profile => {
                            if (profile) {
                                errors.handle = 'That handle already exists';
                                res.status(400).json(errors);
                            }

                            new Profile(profileFields).save().then(profile => res.json(profile));
                        });
                }
            }
            );

        //TODO: Consider adding logic for handling unknown fields and inform user.

    });

// @route   POST api/profile/education
// @desc    Add experience to profile. Required fields are authentication string
//          and the following mandatory items in the body:
//          school, degree, fieldofstudy, and from.
// @access  Private
router.post('/education', passport.authenticate('jwt', { session: false }),
    (req, res) => {

        const { errors, isValid } = validateEducationInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        // Find the profile by the user id in the request and update the profile with the profileFields object.
        Profile.findOne({ user: req.user.id })
            .then(profile => {

                // If the profile exists, update it.
                if (profile) {
                    const education = {
                        school: req.body.school,
                        degree: req.body.degree,
                        fieldofstudy: req.body.fieldofstudy,
                        from: req.body.from,
                        to: req.body.to,
                        current: req.body.current,
                        description: req.body.description
                    };

                    profile.education.unshift(education);
                    profile.save().then(profile => res.json(profile));

                }
            }
            );

        //TODO: 
        // 1. Consider adding logic for handling unknown fields and inform user.
        // 2. Consider updating existing entries.

    });

// @route   POST api/profile/experience
// @desc    Add experience to profile. Required fields are authentication string
//          and the following items in the body:
//          title, company, and from.
// @access  Private
router.post('/experience', passport.authenticate('jwt', { session: false }),
    (req, res) => {

        const { errors, isValid } = validateExperienceInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        // Find the profile by the user id in the request and update the profile with the profileFields object.
        Profile.findOne({ user: req.user.id })
            .then(profile => {

                // If the profile exists, update it.
                if (profile) {
                    const experience = {
                        title: req.body.title,
                        company: req.body.company,
                        location: req.body.location,
                        from: req.body.from,
                        to: req.body.to,
                        current: req.body.current,
                        description: req.body.description
                    };

                    profile.experience.unshift(experience);
                    profile.save().then(profile => res.json(profile));

                }
            }
            );

        //TODO: 
        // 1. Consider adding logic for handling unknown fields and inform user.
        // 2. Consider updating existing entries.

    });

module.exports = router;
