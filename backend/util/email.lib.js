const nodemailer = require("nodemailer");
const errorUtil = require("./error.util");
const validatorUtil = require("./validators.util");
const emailConfig = require("../config/email.config.json");
const sendersMail = emailConfig.credentials.sendersMail;
const password = emailConfig.credentials.password;
const { EMAIL_HOST, EMAIL_PORT } = require("../global.const");

/**
 * @param receiverEmail
 * @param subject
 * @param text
 */
async function sendEmail(receiverEmail, subject, text) {
  try {
    if (
      validatorUtil.isEmpty(receiverEmail) ||
      validatorUtil.isEmpty(subject) ||
      validatorUtil.isEmpty(text)
    ) {
      errorUtil.throwErr(
        "Validation failure : receiverEmail = " +
          receiverEmail +
          " subject = " +
          subject +
          " text = " +
          "text"
      );
    }

    await nodemailer
      .createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: true,
        auth: {
          user: sendersMail,
          pass: password,
        },
      })
      .sendMail({
        from: sendersMail,
        to: receiverEmail,
        subject: subject,
        text: text,
      });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  sendEmail: sendEmail,
};
