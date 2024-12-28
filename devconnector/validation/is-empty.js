
/**
 * Check if value is "defined". 
 * @param {*} value is a string, object, or array 
 * @returns {boolean} true if empty, false if not empty
 */
const isEmpty = (value) => {
    return (
        value === undefined ||
        value === null ||
        (typeof value === 'object' && Object.keys(value).length === 0) ||
        (typeof value === 'string' && value.trim().length === 0)
    )
}

module.exports = isEmpty;
