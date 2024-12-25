// This module provides the interface to the "users.profile" collection in the DB.

// 'mongoose' essentially abstracts the details of establishing a
// DB connection and performing CRUD operations on the 'users' collection. 
const mongoose = require('mongoose');

// First create a generic schema object instance
const Schema = mongoose.Schema;

// Second define the schema structure 
const ProfileSchema = new Schema({

    // This field ties the profile to a user in the users collection.
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },

    //
    // The rest of the fields are the profile fields.
    //

    handle: {
        type: String,
        required: true,
        max: 40
    },

    company: {
        type: String
    },

    website: {
        type: String
    },

    location: {
        type: String
    },

    status: {
        type: String,  // This will be selected from a dropdown 
        required: true
    },

    skills: {
        type: [String],  // This will be a comma separated list
        required: true
    },

    bio: {
        type: String
    },

    githubusername: {
        type: String
    },

    experience: [
        {
            title: {
                type: String,
                required: true
            },
            company: {
                type: String,
                required: true
            },
            location: {
                type: String
            },
            from: {
                type: Date,
                required: true
            },
            to: {
                type: Date
            },
            current: {
                type: Boolean,
                default: false
            },
            description: {
                type: String
            }
        }
    ],

    education: [
        {
            school: {
                type: String,
                required: true
            },
            degree: {
                type: String,
                required: true
            },
            fieldofstudy: {
                type: String,
                required: true
            },
            from: {
                type: Date,
                required: true
            },
            to: {
                type: Date
            },
            current: {
                type: Boolean,
                default: false
            },
            description: {
                type: String
            }
        }
    ],

    social: {
        youtube: {
            type: String
        },
        twitter: {
            type: String
        },
        facebook: {
            type: String
        },
        linkedin: {
            type: String
        },
        instagram: {
            type: String
        }
    },

    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = Profile = mongoose.model('profile', ProfileSchema);