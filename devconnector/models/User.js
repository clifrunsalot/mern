// This module provides the interface to the "users" collection in the DB.

// 'mongoose' essentially abstracts the details of establishing a
// DB connection and performing CRUD operations on the 'users' collection. 
const mongoose = require('mongoose');

// First create a generic schema object instance
const Schema = mongoose.Schema;

// Second define the schema structure 
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Third expose this object for use
module.exports = User = mongoose.model('users', UserSchema);
