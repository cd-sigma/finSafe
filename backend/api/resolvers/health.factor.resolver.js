const mongoLib = require("../../lib/mongo.lib")
const AAVE_V2_PROTOCOL_DATA_PROVIDER_ABI = require("../../abi/aave.v2.protocol.data.provider.abi.json")
const aaveV2ProtocolDataProviderContract = "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d"
const priceLib = require("../../lib/price.lib")

async function calculateHealthFactor(web3, supplied, borrowed) {
    try {

        let collateralSum = 0
        let borrowSum = 0

        for (const supply of supplied) {
            const ethPrice = await priceLib.getTokenPriceFromChainlinkPriceOracle("eth", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", web3)
            collateralSum = collateralSum + ((parseFloat(supply.balance) * parseFloat(supply.usdPrice) * parseFloat(supply.liqudationThreshold)) / parseFloat(ethPrice.usdPrice))
        }

        for (const borrow of borrowed) {
            const ethPrice = await priceLib.getTokenPriceFromChainlinkPriceOracle("eth", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", web3)
            borrowSum = borrowSum + ((parseFloat(borrow.balance) * parseFloat(borrow.usdPrice)) / parseFloat(ethPrice.usdPrice))
        }

        return collateralSum / borrowSum
    } catch (error) {
        throw error
    }
}

async function defaultHealthFactor(position, web3) {
    try {
        const aaveV2ProtocolDataProvider = new web3.eth.Contract(AAVE_V2_PROTOCOL_DATA_PROVIDER_ABI, aaveV2ProtocolDataProviderContract)

        for (const borrow of position.metadata.borrowed) {
            const price = await priceLib.getPriceFromAavePriceOracle([borrow.underlying], web3)
            borrow.price = price[0] / 10 ** 18
            borrow.usdPrice = await priceLib.convertEthAmountToUsd(borrow.price, web3)
            borrow.liqudationThreshold = 0
        }

        for (const supply of position.metadata.supplied) {
            const price = await priceLib.getPriceFromAavePriceOracle([supply.underlying], web3)
            supply.price = price[0] / 10 ** 18
            supply.usdPrice = await priceLib.convertEthAmountToUsd(supply.price, web3)
            supply.liqudationThreshold = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData(supply.underlying).call()).liquidationThreshold) / 10000
        }

        return position
    } catch (error) {
        throw error
    }
}

module.exports = {
    calculateHealthFactor: calculateHealthFactor, defaultHealthFactor: defaultHealthFactor
}
