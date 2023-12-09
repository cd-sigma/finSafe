const uuid = require("uuid")
const ethUtil = require("ethereumjs-util")
const sigUtil = require("@metamask/eth-sig-util")
const jwt = require("jsonwebtoken")

const wrapperUtil = require("../../util/wrapper.util")
const dateUtil = require("../../util/date.util")
const mongoLib = require("../../lib/mongo.lib")
const userModel = require("../../model/user.model")
const validatorUtil = require("../../util/validators.util")

function constructMessage(userDetails) {
    try {
        const message = `Welcome to FINSAFE! \n\nPlease sign in and authorize. By signing in, you agree to our Terms of Service  and Privacy Policy .\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n${userDetails.address}\n\nNonce:\n${userDetails.nonce}`
        const encodedMessage = ethUtil.bufferToHex(Buffer.from(message, "utf8"))
        return encodedMessage
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

async function checkIfUserExistsWithPublicAddress(address) {
    try {
        const user = await mongoLib.findOneByQuery(userModel, {address: address})
        return validatorUtil.isNotEmpty(user)
    } catch (error) {
        throw error
    }
}

async function getUserDetailsWithPublicAddress(address) {
    try {
        let userDetails = await mongoLib.findOneByQuery(userModel, {address: address})
        return userDetails
    } catch (error) {
        throw error
    }
}

async function addUserWithPublicAddress(address) {
    try {
        const userDetails = await mongoLib.createDoc(userModel, {
            address: address,
        })
        return userDetails
    } catch (error) {
        throw error
    }
}

function doesSignatureMatch(address, signature, message) {
    try {
        const recoveredAddress = sigUtil.recoverPersonalSignature({
            data: message, signature: signature,
        })
        return !(validatorUtil.isEmpty(address) || recoveredAddress.toLowerCase() !== address)
    } catch (error) {
        throw error
    }
}

async function updateNonceOfUser(address) {
    try {
        await mongoLib.findOneAndUpdate(userModel, {address: address}, {nonce: uuid.v4()})
    } catch (error) {
        throw error
    }
}

async function markUserWalletVerified(address) {
    try {
        await mongoLib.findOneAndUpdate(userModel, {address: address}, {isWalletVerified: true})
    } catch (error) {
        throw error
    }
}

async function getJwtTokenFromDbForUser(address) {
    try {
        let user = await mongoLib.findOneByQuery(userModel, {address: address})
        return user.jwtToken
    } catch (error) {
        throw error
    }
}

async function updateJwtTokenOfUser(address, jwtToken) {
    try {
        await mongoLib.findOneAndUpdate(userModel, {address: address}, {jwtToken: jwtToken})
    } catch (error) {
        throw error
    }
}

async function isJwtTokenExpired(token) {
    try {
        let decodedToken = await wrapperUtil.safeWrapper(jwt.verify, [token, process.env.JWT_SECRET])
        return validatorUtil.isNil(decodedToken) || decodedToken.exp < dateUtil.getTimestamp()
    } catch (error) {
        throw error
    }
}

async function generateJwtToken(address) {
    try {
        let jwtTokenExpirationTime = "60d"
        return jwt.sign({payload: {address: address}}, process.env.JWT_SECRET, {
            expiresIn: jwtTokenExpirationTime,
        })
    } catch (error) {
        throw error
    }
}


module.exports = {
    constructMessage: constructMessage,
    isSignatureMatched: isSignatureMatched,
    checkIfUserExistsWithPublicAddress: checkIfUserExistsWithPublicAddress,
    getUserDetailsWithPublicAddress: getUserDetailsWithPublicAddress,
    doesSignatureMatch: doesSignatureMatch,
    updateNonceOfUser: updateNonceOfUser,
    markUserWalletVerified: markUserWalletVerified,
    getJwtTokenFromDbForUser: getJwtTokenFromDbForUser,
    updateJwtTokenOfUser: updateJwtTokenOfUser,
    isJwtTokenExpired: isJwtTokenExpired,
    generateJwtToken: generateJwtToken,
    addUserWithPublicAddress: addUserWithPublicAddress
}