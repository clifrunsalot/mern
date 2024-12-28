/**
 * This file is used to validate the login input fields.
 */

////////////////////
//                // 
// IMPORTS        //
//                //
////////////////////

const Validator = require('validator');
const isEmpty = require('./is-empty');

const validateLoginInput = (data) => {

    console.log("data", data)

    // Create an empty errors object to store the errors
    let errors = {};

    // Perform initial check to see if the data.email and data.password are non-null. 
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    // Not empty
    if (Validator.isEmpty(data.email)) {
        errors.email = 'Email is invalid';
    }

    // Not empty
    if (Validator.isEmpty(data.password)) {
        errors.password = 'Password is required';
    }

    // Returns the errors object and isValid value derived from the isEmpty function.
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

module.exports = validateLoginInput;