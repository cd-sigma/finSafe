const responseLib = require("../../lib/response.lib")
const mongoLib = require("../../lib/mongo.lib")

const healthFactorResolver = require("../resolvers/health.factor.resolver")
const validatorUtil = require("../../util/validators.util")
const positionModel = require("../../model/position.model")

const resStatusEnum = require("../../enum/res.status.enum")
const web3Lib = require("../../lib/web3.lib");


async function calculateHealthFactor(req, res) {
    try {
        let web3 = await web3Lib.getWebSocketWeb3Instance(process.env.ETH_NODE_WS_URL);
        let {address} = req.params
        let {
            usdtAmount,
            usdtPrice,
            wbtcAmount,
            wbtcPrice,
            wethAmount,
            wethPrice,
            yfiAmount,
            yfiPrice,
            zrxAmount,
            zrxPrice,
            uniAmount,
            uniPrice,
            aaveAmount,
            aavePrice,
            batAmount,
            batPrice,
            busdAmount,
            busdPrice,
            daiAmount,
            daiPrice,
            enjAmount,
            enjPrice,
            kncAmount,
            kncPrice,
            linkAmount,
            linkPrice,
            manaAmount,
            manaPrice,
            mkrAmount,
            mkrPrice,
            renAmount,
            renPrice,
            snxAmount,
            snxPrice,
            susdAmount,
            susdPrice,
            tusdAmount,
            tusdPrice,
            usdcAmount,
            usdcPrice,
            crvAmount,
            crvPrice,
            balAmount,
            balPrice,
            xsushiAmount,
            xsushiPrice,
            renfilAmount,
            renfilPrice,
            raiAmount,
            raiPrice,
            amplAmount,
            amplPrice,
            usdpAmount,
            usdpPrice,
            dpiAmount,
            dpiPrice,
            fraxAmount,
            fraxPrice,
            feiAmount,
            feiPrice,
            stethAmount,
            stethPrice,
            ensAmount,
            ensPrice,
            gusdAmount,
            gusdPrice,
            ustAmount,
            ustPrice,
            cvxAmount,
            cvxPrice,
            oneinchAmount,
            oneinchPrice,
            lusdAmount,
            lusdPrice
        } = req.body

        if (validatorUtil.isEmpty(address)) {
            return responseLib.sendResponse(res, null, "Missing user address", resStatusEnum.VALIDATION_ERROR)
        }

        address = address.toLowerCase()

        const position = await mongoLib.findOneByQuery(positionModel, {owner: address})

        if (validatorUtil.isEmpty(position)) {
            return responseLib.sendResponse(res, null, "No position found", resStatusEnum.VALIDATION_ERROR)
        }

        const healthFactor = await healthFactorResolver.calculateHealthFactor(position, web3, usdtAmount,
            usdtPrice, wbtcAmount, wbtcPrice, wethAmount, wethPrice, yfiAmount, yfiPrice, zrxAmount, zrxPrice, uniAmount,
            uniPrice, aaveAmount, aavePrice, batAmount, batPrice, busdAmount, busdPrice, daiAmount, daiPrice,
            enjAmount, enjPrice, kncAmount, kncPrice, linkAmount, linkPrice, manaAmount, manaPrice, mkrAmount,
            mkrPrice, renAmount, renPrice, snxAmount, snxPrice, susdAmount, susdPrice, tusdAmount, tusdPrice,
            usdcAmount, usdcPrice, crvAmount, crvPrice, balAmount, balPrice, xsushiAmount, xsushiPrice, renfilAmount,
            renfilPrice, raiAmount, raiPrice, amplAmount, amplPrice, usdpAmount, usdpPrice, dpiAmount, dpiPrice,
            fraxAmount, fraxPrice, feiAmount, feiPrice, stethAmount, stethPrice, ensAmount, ensPrice, gusdAmount,
            gusdPrice, ustAmount, ustPrice, cvxAmount, cvxPrice, oneinchAmount, oneinchPrice, lusdAmount, lusdPrice
        )

        return responseLib.sendResponse(res, healthFactor, null, resStatusEnum.SUCCESS)


    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR)
    }
}

module.exports = {
    calculateHealthFactor: calculateHealthFactor
}