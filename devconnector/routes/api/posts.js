/**
 * This file contains the routes and custom logic for the posts actions.
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

const Post = require('../../models/Post');

///////////////
//           // 
// Validator //
//           //
///////////////

const validatePostInput = require('../../validation/post');

// @route   GET api/posts/test
// @desc    Tests posts route
// @access  Public
router.get('/test', (req, res) => {
    res.json({ msg: 'Posts works' });
});

// @route   POST api/posts
// @desc    Create post. The body contains the text, name, and avatar of the user.
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
    });

    newPost.save().then(post => res.json(post));

    res.json({ msg: 'Success' });
});


module.exports = router;