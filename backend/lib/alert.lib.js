const mongoLib = require("../mongo.lib");
const alertModel = require("../../model/alert.model");
const validatorUtil = require("../../util/validators.util");

async function generateAlert(address, content) {
    try {
        if (validatorUtil.isEmpty(address) || validatorUtil.isEmpty(content)) {
            throw new Error(`Invalid address or content! address : ${address}, content : ${content}`);
        }

        await mongoLib.createDoc(alertModel, {
            address: address.toLowerCase(),
            content: content
        });
    } catch (error) {
        throw error;
    }
}

module.exports = {
    generateAlert: generateAlert
}