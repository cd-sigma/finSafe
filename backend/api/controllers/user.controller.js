const responseLib = require("../../lib/response.lib")
const mongoLib = require("../../lib/mongo.lib")

const validatorUtil = require("../../util/validators.util")
const userModel = require("../../model/user.model")
const positionModel = require("../../model/position.model")

const resStatusEnum = require("../../enum/res.status.enum")

async function getUserPositions(req, res) {
    try {
        let {userAddress} = req.params

        if (validatorUtil.isEmpty(userAddress)) {
            return responseLib.sendResponse(res, null, "Missing user address", resStatusEnum.VALIDATION_ERROR)
        }

        userAddress = userAddress.toLowerCase()
        const userPosition = await mongoLib.findByQuery(positionModel, {userAddress: userAddress})
        if (validatorUtil.isEmpty(userPosition)) {
            return responseLib.sendResponse(res, null, "No positions found", resStatusEnum.NOT_FOUND)
        }

        return responseLib.sendResponse(res, userPosition, null, resStatusEnum.SUCCESS)

    } catch (error) {
        return responseLib.sendResponse(res, null, error, 500)
    }
}

async function getNonce(req, res) {
    try {
        let {userAddress} = req.params

        if (validatorUtil.isEmpty(userAddress)) {
            return responseLib.sendResponse(res, null, "Missing user address", resStatusEnum.VALIDATION_ERROR)
        }

        userAddress = userAddress.toLowerCase()

        let userDetails = await mongoLib.findOneByQuery(userModel, {publicAddress: userAddress})

        if (validatorUtil.isEmpty(userDetails)) {
            let userData = {publicAddress: userAddress}
            userDetails = await mongoLib.createDoc(userModel, userData)
            return responseLib.sendResponse(res, {
                exists: Boolean(userDetails), nonce: userDetails.nonce,
            }, null, resStatusEnum.SUCCESS,)
        }

        return responseLib.sendResponse(res, {
            exists: Boolean(userDetails), nonce: userDetails.nonce,
        }, null, resStatusEnum.SUCCESS,)

    } catch (error) {
        return responseLib.sendResponse(res, null, error, 500)
    }
}

module.exports = {
    getUserPositions: getUserPositions, getNonce: getNonce
}