const mongoLib = require("../mongo.lib");
const errorUtil = require("../util/error.util");
const alertModel = require("../../model/alert.model");
const validatorUtil = require("../../util/validators.util");

async function generateAlert(address, content) {
    try {
        if (validatorUtil.isEmpty(address) || validatorUtil.isEmpty(content)) {
            errorUtil.throwErr(`Invalid address or content! address : ${address}, content : ${content}`);
        }

        await mongoLib.createDoc(alertModel, {
            address: address.toLowerCase(),
            content: content
        });
    } catch (error) {
        throw error;
    }
}

function validateEmailOptions(options = {}) {
  if (
    validatorUtil.isEmpty(options) ||
    validatorUtil.isEmpty(options.receiverEmail) ||
    validatorUtil.isEmpty(options.subject) ||
    validatorUtil.isEmpty(options.text)
  ) {
    errorUtil.throwErr("validation error for email type notifications");
  }
}


module.exports = {
  generateAlert: generateAlert,
  validateEmailOptions: validateEmailOptions,
};
