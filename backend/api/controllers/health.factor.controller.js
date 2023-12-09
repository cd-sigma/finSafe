const responseLib = require("../../lib/response.lib")

const healthFactorResolver = require("../resolvers/health.factor.resolver")
const validatorUtil = require("../../util/validators.util")

const resStatusEnum = require("../../enum/res.status.enum")


async function calculateHealthFactor(req, res) {
    try {
        let {address} = req.params

        if (validatorUtil.isEmpty(address)) {
            return responseLib.sendResponse(res, null, "Missing user address", resStatusEnum.VALIDATION_ERROR)
        }

        address = address.toLowerCase()


        const healthFactor = await healthFactorResolver.calculateHealthFactor(address)

        return responseLib.sendResponse(res, healthFactor, null, resStatusEnum.SUCCESS)


    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR)
    }
}

module.exports = {
    calculateHealthFactor: calculateHealthFactor
}