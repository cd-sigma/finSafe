const {PushAPI, CONSTANTS} = require("@pushprotocol/restapi");
const ethers = require('ethers');

const globalLib = require("./global.lib");
const errorUtil = require('../util/error.util');
const validatorUtil = require('../util/validators.util');

const globalKeysEnum = require("../enum/global.keys.enum");

async function initializePush(channelPrivateKey) {
    try {
        if (validatorUtil.isEmpty(channelPrivateKey)) {
            errorUtil.throwErr(`Invalid channelPrivateKey! channelPrivateKey: ${channelPrivateKey}`);
        }

        const _signer = new ethers.Wallet(channelPrivateKey);
        const pushUser = await PushAPI.initialize(_signer, {env: CONSTANTS.ENV.STAGING});
        globalLib.setGlobalKey(globalKeysEnum.pushUser, pushUser);
    } catch (error) {
        throw error;
    }
}

async function sendAlert(address, title, body) {
    try {
        if (validatorUtil.isEmpty(address) || validatorUtil.isEmpty(title) || validatorUtil.isEmpty(body)) {
            errorUtil.throwErr(`Invalid address or title or body! address: ${address}, title: ${title}, body: ${body}`);
        }

        //TODO: add a check here to see if address is subscribed to the channel or not.

        const resp=await globalLib.getGlobalKey(globalKeysEnum.pushUser).channel.send([address], {
            notification: {title: title, body: body},
        });
    } catch (error) {
        throw error;
    }
}


module.exports = {
    sendAlert: sendAlert,
    initializePush: initializePush
}