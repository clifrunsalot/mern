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

// @route   GET api/profile/user/:_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:_id', (req, res) => {

    // Create an empty object to store any errors.
    const errors = {};

    // Parse the incoming request
    // The 'user' field in the profile collection is unique. The 'findOne' method will
    // return the first profile that matches the query. The query is that the 'user' field in the
    // profile collection matches the 'user_id' field in the request.
    Profile.findOne({ user: req.params._id })
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
        const fields = ['handle', 'company', 'website', 'location', 'bio', 'status', 'githubusername'];
        fields.forEach(field => {
            if (req.body[field]) profileFields[field] = req.body[field];
        });

        // Skills - split into array
        if (typeof req.body.skills !== 'undefined') {
            profileFields.skills = req.body.skills.split(',');
        }

        // Social
        // Keep in mind that social object has subfields.
        profileFields.social = {};
        const socialFields = ['youtube', 'twitter', 'facebook', 'linkedin', 'instagram'];
        socialFields.forEach(field => {
            if (req.body[field]) profileFields.social[field] = req.body[field];
        });

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

// @route   PUT api/profile/education
// @desc    Add education to profile. Required fields are authentication string
//          and the following mandatory items in the body:
//          school, degree, fieldofstudy, and from.
// @access  Private
router.put('/education', passport.authenticate('jwt', { session: false }),
    (req, res) => {

        const { errors, isValid } = validateEducationInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        // Find the profile by the user id in the request.
        // The user id is stored in the token, so we can use that to find the profile.
        Profile.findOne({ user: req.user.id })
            .then(profile => {

                // If the profile exists, simply add it. 
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

                    // Insert entry at beginning of array.
                    profile.education.unshift(education);
                    profile.save().then(profile => res.json(profile));
                }
            });

        //TODO: 
        // Consider adding logic for handling unknown fields and informing user.

    });

// @route   POST api/profile/education/:_id
// @desc    Update education to profile. Required fields are authentication string
//          and the following mandatory items in the body:
//          school, degree, fieldofstudy, and from.
// @access  Private
router.post('/education/:_id', passport.authenticate('jwt', { session: false }),
    (req, res) => {

        const { errors, isValid } = validateEducationInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        // Find the profile by the user id in the request.
        // The user id is stored in the token, so we can use that to find the profile.
        Profile.findOne({ user: req.user.id })
            .then(profile => {

                // If the profile exists, drill down into education. 
                if (profile) {

                    const foundIdx = profile.education.map(item => item.id).indexOf(req.params._id);

                    // If the education entry is found, apply updates. 
                    if (foundIdx != -1) {

                        const education = {
                            school: req.body.school,
                            degree: req.body.degree,
                            fieldofstudy: req.body.fieldofstudy,
                            from: req.body.from,
                            to: req.body.to,
                            current: req.body.current,
                            description: req.body.description
                        };

                        profile.education[foundIdx] = education;
                        profile.save().then(profile => res.json(profile));

                    } else {
                        res.status(404).json({ education: 'Education not found' });
                    }
                }
            });

        //TODO: 
        // Consider adding logic for handling unknown fields and informing user.

    });

// @route   DELETE api/profile/education/:_id
// @desc    Remove education from profile. 
// @access  Private
router.delete('/education/:_id', passport.authenticate('jwt', { session: false }),
    (req, res) => {

        // Find the profile by the user id in the request.
        // NOTE: The user id is stored in the token, so we can use that to find the profile. 
        Profile.findOne({ user: req.user._id })
            .then(profile => {

                // If the profile exists, update it.
                if (profile) {

                    const foundIdx = profile.education.map(item => item.id).indexOf(req.params._id);
                    if (foundIdx != -1) {

                        // Use the 'pull' operator to remove the education entry from the profile.
                        profile.education.pull(req.params._id);
                        profile.save().then(profile => res.json(profile));

                    } else {
                        res.status(404).json({ education: 'Education not found' });
                    }
                }
            })
            .catch(err => res.status(404).json(err));
    });

// @route   PUT api/profile/experience
// @desc    Add experience to profile. Required fields are authentication string
//          and the following items in the body:
//          title, company, and from.
// @access  Private
router.put('/experience', passport.authenticate('jwt', { session: false }),
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

                    // Insert entry at beginning of array.
                    profile.experience.unshift(experience);
                    profile.save().then(profile => res.json(profile));

                }
            }
            );

        //TODO: 
        // 1. Consider adding logic for handling unknown fields and inform user.

    });
// @route   POST api/profile/experience/:_id
// @desc    Update experience to profile. Required fields are authentication string
//          and the following items in the body:
//          title, company, and from.
// @access  Private
router.post('/experience/:_id', passport.authenticate('jwt', { session: false }),
    (req, res) => {

        const { errors, isValid } = validateExperienceInput(req.body);

        if (!isValid) {
            return res.status(400).json(errors);
        }

        // Find the profile by the user id in the request.
        Profile.findOne({ user: req.user.id })
            .then(profile => {

                // If the profile exists, update it.
                if (profile) {

                    const foundIdx = profile.experience.map(item => item.id).indexOf(req.params._id);
                    if (foundIdx != -1) {

                        const experience = {
                            title: req.body.title,
                            company: req.body.company,
                            location: req.body.location,
                            from: req.body.from,
                            to: req.body.to,
                            current: req.body.current,
                            description: req.body.description
                        };

                        profile.experience[foundIdx] = experience;
                        profile.save().then(profile => res.json(profile));

                    } else {
                        res.status(404).json({ experience: 'Experience not found' });
                    }
                }
            });

        //TODO: 
        // 1. Consider adding logic for handling unknown fields and inform user.

    });

// @route   DELETE api/profile/experience/:_id
// @desc    Remove experience from profile. 
// @access  Private
router.delete('/experience/:_id', passport.authenticate('jwt', { session: false }),
    (req, res) => {

        // Find the profile by the user id in the request.
        // NOTE: The user id is stored in the token, so we can use that to find the profile. 
        Profile.findOne({ user: req.user._id })
            .then(profile => {

                // If the profile exists, update it.
                if (profile) {

                    const foundIdx = profile.experience.map(item => item.id).indexOf(req.params._id);
                    if (foundIdx != -1) {

                        // Use the 'pull' operator to remove the education entry from the profile.
                        profile.experience.pull(req.params._id);
                        profile.save().then(profile => res.json(profile));

                    } else {
                        res.status(404).json({ experience: 'Experience not found' });
                    }
                }
            })
            .catch(err => res.status(404).json(err));

    });

// @route   DELETE api/profile
// @desc    Remove profile. 
// @access  Private
router.delete('/', passport.authenticate('jwt', { session: false }),
    (req, res) => {

        // Find the profile by the user id in the request.
        // NOTE: The user id is stored in the token, so we can use that to find the profile. 
        Profile.findOneAndDelete({ user: req.user._id })
            .then(() => res.json({ success: true }))
            .catch(err => res.status(404).json(err));

    });

module.exports = router;
