const axios = require("axios");
const apiKeyConfig = require("../../config/api.key.config.json")

const web3Lib = require("../../lib/web3.lib")
const priceLib = require("../../lib/price.lib")
const responseLib = require("../../lib/response.lib")
const validatorsUtil = require("../../util/validators.util")
const resStatusEnum = require("../../enum/res.status.enum")

async function getTokenInfo(req, res) {
    try {
        let web3 = await web3Lib.getWebSocketWeb3Instance(process.env.ETH_NODE_WS_URL);
        let {tokenAddress} = req.params
        let tokenPrice

        if (validatorsUtil.isEmpty(tokenAddress)) {
            return responseLib.sendResponse(res, null, "Missing token Address", resStatusEnum.VALIDATION_ERROR)
        }
        tokenAddress = tokenAddress.toLowerCase()
        const url = `https://api.1inch.dev/token/v1.2/1/custom/${tokenAddress}`;

        const config = {
            headers: {
                "Authorization": `Bearer ${apiKeyConfig["1inch"]}`
            }, params: {}
        };

        const response = await axios.get(url, config);
        if (validatorsUtil.isEmpty(response) || validatorsUtil.isEmpty(response.data)) {
            return responseLib.sendResponse(res, null, "token not available", resStatusEnum.INTERNAL_SERVER_ERROR)
        }

        try {
            tokenPrice = await priceLib.getTokenPriceFromChainlinkPriceOracle("eth", tokenAddress, web3)
        } catch (error) {
            tokenPrice = await priceLib.getPriceFromAavePriceOracle([tokenAddress], web3)
            const decimals = await priceLib.getDecimalsForAsset(tokenAddress,web3)
            console.log(tokenPrice)
        }
        response.data.price = tokenPrice.usdPrice
        return responseLib.sendResponse(res, response.data, null, resStatusEnum.SUCCESS)

    } catch (error) {
        return responseLib.sendResponse(res, null, error, resStatusEnum.INTERNAL_SERVER_ERROR)
    }
}

module.exports = {
    getTokenInfo: getTokenInfo
}