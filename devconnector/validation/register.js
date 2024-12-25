/**
 * This file is used to validate the register input fields.
 */

////////////////////
//                // 
// IMPORTS        //
//                //
////////////////////

const Validator = require('validator');
const isEmpty = require('./is-empty');

const validateRegisterInput = (data) => {

    console.log("data", data)

    // Create an empty errors object to store the errors
    let errors = {};

    // Perform initial check to see if the data.name, data.email, data.password, and data.password2 are empty.
    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';

    //--- Validate the name field ---//
    // Length is between 2 and 30 characters 
    if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
        errors.name = 'Name must be between 2 and 30 characters';
    }

    // Not empty
    if (Validator.isEmpty(data.name)) {
        errors.name = 'Name field is required';
    }

    //--- Validate the email field ---//
    if (!Validator.isEmail(data.email)) {
        errors.email = 'Email is invalid';
    }

    //--- Validate the password field ---//
    // Length is between 6 and 30 characters
    if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
        errors.password = 'Password length must be >= 6 and < 30 characters';
    }

    // Not empty
    if (Validator.isEmpty(data.password)) {
        errors.password = 'Password field is required';
    }

    //--- Validate the password2 field ---//
    // Length is between 6 and 30 characters
    if (!Validator.isLength(data.password2, { min: 6, max: 30 })) {
        errors.password2 = 'Password2 length must be >= 6 and < 30 characters';
    }

    // Not empty
    if (Validator.isEmpty(data.password2)) {
        errors.password2 = 'Password2 field is required';
    }

    // Passwords must match
    if (!Validator.equals(data.password, data.password2)) {
        errors.password2 = 'Passwords must match';
    }

    // Returns the errors object and isValid value derived from the isEmpty function.
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

module.exports = validateRegisterInput;