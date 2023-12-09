const uuid = require("uuid")
const responseLib = require("../../lib/response.lib")
const mongoLib = require("../../lib/mongo.lib")
const jwtAuthLib = require("../../lib/jwt.auth.lib")

const validatorUtil = require("../../util/validators.util")
const userResolver = require("../resolvers/user.resolver")

const userModel = require("../../model/user.model")
const positionModel = require("../../model/position.model")

const resStatusEnum = require("../../enum/res.status.enum")

async function getUserPositions(req, res) {
    try {
        let {address} = req.params

        if (validatorUtil.isEmpty(address)) {
            return responseLib.sendResponse(res, null, "Missing user address", resStatusEnum.VALIDATION_ERROR)
        }

        address = address.toLowerCase()
        const userPosition = await mongoLib.findByQuery(positionModel, {owner: address})
        if (validatorUtil.isEmpty(userPosition)) {
            return responseLib.sendResponse(res, null, "No positions found", resStatusEnum.NOT_FOUND)
        }
        return responseLib.sendResponse(res, userPosition, null, resStatusEnum.SUCCESS)

    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR)
    }
}

async function getNonce(req, res) {
    try {
        let {address} = req.params

        if (validatorUtil.isEmpty(address)) {
            return responseLib.sendResponse(res, null, "Missing user address", resStatusEnum.VALIDATION_ERROR)
        }

        address = address.toLowerCase()

        let userDetails = await mongoLib.findOneByQuery(userModel, {address: address})

        if (validatorUtil.isEmpty(userDetails)) {
            let userData = {address: address}
            userDetails = await mongoLib.createDoc(userModel, userData)
            return responseLib.sendResponse(res, {
                exists: Boolean(userDetails), nonce: userDetails.nonce,
            }, null, resStatusEnum.SUCCESS,)
        }

        return responseLib.sendResponse(res, {
            exists: Boolean(userDetails), nonce: userDetails.nonce,
        }, null, resStatusEnum.SUCCESS,)

    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR)
    }
}

async function validateSignature(req, res) {
    try {
        let {address = null, signature = null} = req.body
        if (validatorUtil.isEmpty(address) || validatorUtil.isEmpty(signature)) {
            return responseLib.sendResponse(res, null, "Missing user address or signature", resStatusEnum.VALIDATION_ERROR)
        }
        address = address.toLowerCase()
        const userExists = await userResolver.checkIfUserExistsWithPublicAddress(address)

        if (!userExists) {
            return responseLib.sendResponse(res, null, "User not found", resStatusEnum.NOT_FOUND)
        }

        const userDetails = await userResolver.getUserDetailsWithPublicAddress(address)
        const message = userResolver.constructMessage(userDetails)
        const didSignatureMatch = await userResolver.doesSignatureMatch(address, signature, message)
        if (!didSignatureMatch) {
            return responseLib.sendResponse(res, null, `Signature Verification Failed`, resStatusEnum.UNAUTHORIZED,)
        }
        await userResolver.updateNonceOfUser(userDetails._id)
        await userResolver.markUserWalletVerified(userDetails._id)

        let token = await userResolver.getJwtTokenFromDbForUser(userDetails._id)
        if (validatorUtil.isNil(token) || (await userResolver.isJwtTokenExpired(token))) {
            token = await userResolver.generateJwtToken(userDetails._id)
            await userResolver.updateJwtTokenOfUser(userDetails._id, token)
        }

        return responseLib.sendResponse(res, {token: token}, null, resStatusEnum.SUCCESS,)

    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR)
    }
}

module.exports = {
    getUserPositions: getUserPositions, getNonce: getNonce, validateSignature: validateSignature
}