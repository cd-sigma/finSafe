/** @param {string} message
 * @param {object} jsonData
 */
function throwErr(message, jsonData = {}) {
  let err = new Error(message);
  err.data = JSON.stringify(jsonData);
  throw err;
}

module.exports = {
  throwErr: throwErr,
};
