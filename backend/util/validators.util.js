/**
 * @param {*} value
 * @return {boolean}
 */
function isEmpty(value) {
    return (value === undefined || value === null || value === "" || (typeof value === "object" && Object.keys(value).length === 0) || (Array.isArray(value) && value.length === 0));
}

function isNotEmpty(value) {
    return !isEmpty(value);
}

function isNil(value) {
    return value === undefined || value === null;
}

function isFalsy(value) {
    return value === false || value === null || value === "";
}

module.exports = {
    isEmpty: isEmpty, isNotEmpty: isNotEmpty, isNil: isNil, isFalsy: isFalsy
};
