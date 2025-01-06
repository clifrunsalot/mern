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

// @route   GET api/posts
// @desc    Get posts
// @access  Public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({ nopostsfound: 'No posts found' }));
});

// @route   GET api/posts/:id
// @desc    Get post by id
// @access  Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({ nopostfound: 'No post found with that ID' }));
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

// @route   DELETE api/posts/:id
// @desc    Delete post by id
// @access  Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    // Look for the post by id first
    Post.findById(req.params.id)
        .then(post => {

            // Confirm that the user is the owner of the post to be deleted. 
            if (post.user.toString() !== req.user.id) {
                return res.status(401).json({ notauthorized: 'User not authorized' });
            }

            // Delete
            post.remove().then(() => res.json({ success: true }));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
});

// @route   POST api/posts/like/:id
// @desc    Like post by id 
// @access  Private
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    // Look for the post by id first
    Post.findById(req.params.id)
        .then(post => {

            // Check if the user has already liked the post
            post.likes.aggregate({ $match: { user: req.user.id } }).length > 0
                ? res.status(400).json({ alreadyliked: 'User already liked this post' })
                : post.likes.unshift({ user: req.user.id });
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
});



module.exports = router;