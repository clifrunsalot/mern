/**
 * This file is used to validate the education fields.
 */

////////////////////
//                // 
// IMPORTS        //
//                //
////////////////////

const Validator = require('validator');
const isEmpty = require('./is-empty');

const validateEducationInput = (data) => {

    console.log("data", data)

    // Create an empty errors object to store the errors
    let errors = {};

    // Perform initial check to see if the corresponding data fields are non-null. 
    data.school = !isEmpty(data.school) ? data.school : '';
    data.degree = !isEmpty(data.degree) ? data.degree : '';
    data.fieldofstudy = !isEmpty(data.fieldofstudy) ? data.fieldofstudy : '';
    data.from = !isEmpty(data.from) ? data.from : '';

    if (Validator.isEmpty(data.school)) {
        errors.school = 'Profile school is required';
    }

    if (Validator.isEmpty(data.degree)) {
        errors.degree = 'degree field is required';
    }

    if (Validator.isEmpty(data.fieldofstudy)) {
        errors.fieldofstudy = 'fieldofstudy field are required';
    }

    if (Validator.isEmpty(data.from)) {
        errors.from = 'from field are required';
    }

    // Returns the errors object and isValid value derived from validation.
    return {
        errors,
        isValid: isEmpty(errors)
    }
}

module.exports = validateEducationInput;