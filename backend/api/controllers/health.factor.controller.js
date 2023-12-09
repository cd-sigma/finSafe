const responseLib = require("../../lib/response.lib")
const mongoLib = require("../../lib/mongo.lib")

const healthFactorResolver = require("../resolvers/health.factor.resolver")
const validatorUtil = require("../../util/validators.util")
const positionModel = require("../../model/position.model")

const resStatusEnum = require("../../enum/res.status.enum")
const web3Lib = require("../../lib/web3.lib");

async function defaultHealthFactor(req, res) {
    try {
        let web3 = await web3Lib.getWebSocketWeb3Instance(process.env.ETH_NODE_WS_URL);
        let {address} = req.params

        if (validatorUtil.isEmpty(address)) {
            return responseLib.sendResponse(res, null, "Missing user address", resStatusEnum.VALIDATION_ERROR)
        }

        address = address.toLowerCase()

        const position = await mongoLib.findOneByQuery(positionModel, {owner: address})

        if (validatorUtil.isEmpty(position)) {
            return responseLib.sendResponse(res, null, "No position found", resStatusEnum.VALIDATION_ERROR)
        }

        const healthFactor = await healthFactorResolver.defaultHealthFactor(position, web3)

        return responseLib.sendResponse(res, healthFactor, null, resStatusEnum.SUCCESS)

    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR)
    }
}

async function calculateHealthFactor(req, res) {
    try {
        let web3 = await web3Lib.getWebSocketWeb3Instance(process.env.ETH_NODE_WS_URL);
        let {address} = req.params
        let {
            collateralAssets = [],
            collateralAmounts = [],
            collateralPrices = [],
            debtAssets = [],
            debtAmounts = [],
            debtPrices = [],
            liquidationThresholds = []
        } = req.body

        if (validatorUtil.isEmpty(address)) {
            return responseLib.sendResponse(res, null, "Missing user address", resStatusEnum.VALIDATION_ERROR)
        }

        address = address.toLowerCase()

        const position = await mongoLib.findOneByQuery(positionModel, {owner: address})

        if (validatorUtil.isEmpty(position)) {
            return responseLib.sendResponse(res, null, "No position found", resStatusEnum.VALIDATION_ERROR)
        }

        const healthFactor = await healthFactorResolver.calculateHealthFactor(position, web3, collateralAssets, collateralAmounts, collateralPrices, debtAssets, debtAmounts, debtPrices, liquidationThresholds)

        return responseLib.sendResponse(res, healthFactor, null, resStatusEnum.SUCCESS)


    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR)
    }
}

module.exports = {
    calculateHealthFactor: calculateHealthFactor,
    defaultHealthFactor: defaultHealthFactor
}