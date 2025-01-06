/**
 * This file is used to validate the post input fields.
 */

////////////////////
//                // 
// IMPORTS        //
//                //
////////////////////

const Validator = require('validator');
const isEmpty = require('./is-empty');

const validatePostInput = (data) => {

    console.log("data", data)

    // Create an empty errors object to store the errors
    let errors = {};

    // Perform initial check to see if the data.text field is empty. If it is, set it to an empty string.
    data.text = !isEmpty(data.text) ? data.text : '';

    if (!Validator.isLength(data.text, { min: 10, max: 300 })) {
        errors.text = 'Post must be between 10 and 300 characters';
    }

    if (Validator.isEmpty(data.text)) {
        errors.text = 'Text field is invalid';
    }

    // Returns the errors object and isValid value derived from the isEmpty function.
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

module.exports = validatePostInput;