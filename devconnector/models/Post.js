// This module provides the interface to the "users.posts" collection in the DB.

// 'mongoose' essentially abstracts the details of establishing a
// DB connection and performing CRUD operations on the 'posts' collection. 
const mongoose = require('mongoose');

// First create a generic schema object instance
const Schema = mongoose.Schema;

// Create a schema object instance for the 'posts' collection
const PostSchema = new Schema({
    user: {
        // This is the key to the 'users' collection
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    text: {
        type: String,
        required: true
    },
    name: {
        type: String
    },
    avatar: {
        type: String
    },
    likes: [
        {
            user: {
                // Each "like" is associated with a user
                type: Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ],
    comments: [
        {
            user: {
                // Each "comment" is associated with a user
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {
                type: String,
                required: true
            },
            name: {
                type: String
            },
            avatar: {
                type: String
            },
            date: {
                type: Date,
                default: Date.now
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = Posts = mongoose.model('post', PostSchema);
