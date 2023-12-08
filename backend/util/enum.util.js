const validationUtil = require("../util/validators.util");
const errorUtil = require("../util/error.util");

function validateEnumUtil(value, enumObject) {
  if (validationUtil.isEmpty(value) || validationUtil.isEmpty(enumObject)) {
    errorUtil.throwErr(
      "validation failed value : " + value + " enumObject : " + enumObject
    );
  }
}

/**
 * @param {string} value
 * @param {object} enumObject
 * @return {string}
 */
function getKeyByValue(value, enumObject) {
  try {
    validateEnumUtil();
    const index = Object.values(enumObject).indexOf(value);
    return Object.keys(enumObject)[index];
  } catch (e) {
    throw e;
  }
}

/**
 * @param {string} value
 * @param {object} enumObject
 * @return {boolean}
 */
function isValidEnumValue(value, enumObject) {
  try {
    validateEnumUtil();
    return Object.values(enumObject).includes(value);
  } catch (e) {
    throw e;
  }
}

/**
 * @param {string} value
 * @param {object} enumObject
 * @return {boolean}
 */
function isValidEnumKey(value, enumObject) {
  try {
    validateEnumUtil();
    return Object.keys(enumObject).includes(value);
  } catch (e) {
    throw e;
  }
}

/**
 * @param {string} value
 * @param {object} enumObject
 * @return {boolean}
 */
function isNotValidEnumValue(value, enumObject) {
  return !isValidEnumValue(value, enumObject);
}

/**
 * @param {string} value
 * @param {object} enumObject
 * @return {boolean}
 */
function isNotValidEnumKey(value, enumObject) {
  return !isValidEnumKey(value, enumObject);
}

module.exports = {
  getKeyByValue: getKeyByValue,
  isValidEnumValue: isValidEnumValue,
  isValidEnumKey: isValidEnumKey,
  isNotValidEnumKey: isNotValidEnumKey,
  isNotValidEnumValue: isNotValidEnumValue,
  //validateEnumUtil:validateEnumUtil
};
