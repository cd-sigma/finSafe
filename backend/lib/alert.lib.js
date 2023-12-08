const validatorUtil = require("../util/validators.util");
const errorUtil = require("../util/error.util");
const enumUtil = require("../util/enum.util");
const alertTypeEnum = require("../enum/alert.enum");
const emailLib = require("../lib/email.lib");

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

async function sendAlert(alertType, options = {}) {
  try {
    if (enumUtil.isNotValidEnumValue(alertType, alertTypeEnum)) {
      errorUtil.throwErr("validation error alertType = " + alertType);
    }
    switch (alertType) {
      case alertTypeEnum.EMAIL:
        validateEmailOptions(options);
        await emailLib.sendEmail(
          options.receiverEmail,
          options.subject,
          options.text
        );
        break;
      default:
        errorUtil.throwErr("Illegal state exception for alertTypeEnum");
    }
  } catch (e) {
    throw e;
  }
}

module.exports = {
  sendAlert: sendAlert,
  validateEmailOptions: validateEmailOptions,
};
