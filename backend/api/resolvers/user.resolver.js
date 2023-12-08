const ethUtil = require("ethereumjs-util")
const sigUtil = require("@metamask/eth-sig-util")

const validatorUtil = require("../../util/validators.util")

async function constructMessage(userDetails) {
    try {
        if (validatorUtil.isEmpty(userDetails)) {
            return null
        }
        const message = `Welcome to InsideFi.io! \n\nPlease sign in and authorize. By signing in, you agree to our Terms of Service (https://insidefi.io/terms) and Privacy Policy (https://insidefi.io/privacy).\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n${userDetails.publicAddress}\n\nNonce:\n${userDetails.nonce}`
        return ethUtil.bufferToHex(Buffer.from(message, "utf8"))
    } catch (error) {
        throw error
    }
}

async function isSignatureMatched(address, signature, msgBufferHex) {
    try {
        if (validatorUtil.isEmpty(address) || validatorUtil.isEmpty(signature) || validatorUtil.isEmpty(msgBufferHex)) {
            return false
        }
        const addressToCheck = sigUtil.recoverPersonalSignature({data: msgBufferHex, signature: signature})
        if (validatorUtil.isEmpty(addressToCheck)) {
            return false
        }
        if (addressToCheck.toLowerCase() !== address.toLowerCase()) {
            return false
        }
        return true
    } catch (error) {
        throw error
    }
}


module.exports = {
    constructMessage: constructMessage, isSignatureMatched: isSignatureMatched
}