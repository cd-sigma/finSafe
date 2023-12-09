const mongoLib = require("../../lib/mongo.lib")
const AAVE_V2_PROTOCOL_DATA_PROVIDER_ABI = require("../../abi/aave.v2.protocol.data.provider.abi.json")
const aaveV2ProtocolDataProviderContract = "0x057835Ad21a177dbdd3090bB1CAE03EaCF78Fc6d"
const priceLib = require("../../lib/price.lib")

async function calculateHealthFactor(position, web3, collateralAssets, collateralAmounts, collateralPrices, debtAssets, debtAmounts, debtPrices, liquidationThresholds) {
    try {
        const aaveV2ProtocolDataProvider = new web3.eth.Contract(AAVE_V2_PROTOCOL_DATA_PROVIDER_ABI, aaveV2ProtocolDataProviderContract)

        const liqudationThresholdForTusd = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x0000000000085d4780B73119b644AE5ecd22b376").call()).liquidationThreshold) / 10000
        const liqudationThresholdForUsdc = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48").call()).liquidationThreshold) / 10000
        const liqudationThresholdForCrv = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0xd533a949740bb3306d119cc777fa900ba034cd52").call()).liquidationThreshold) / 10000
        const liqudationThresholdForBal = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0xba100000625a3754423978a60c9317c58a424e3d").call()).liquidationThreshold) / 10000
        const liqudationThresholdForXsushi = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272").call()).liquidationThreshold) / 10000
        const liqudationThresholdForUsdp = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x1456688345527be1f37e9e627da0837d6f08c925").call()).liquidationThreshold) / 10000
        const liqudationThresholdForDpi = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b").call()).liquidationThreshold) / 10000
        const liqudationThresholdForFei = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x956f47f50a910163d8bf957cf5846d573e7f87ca").call()).liquidationThreshold) / 10000
        const liqudationThresholdForSteth = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0xae7ab96520de3a18e5e111b5eaab095312d7fe84").call()).liquidationThreshold) / 10000
        const liqudationThresholdForEns = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x57f8160e1c59d4346abb5cdefac810967e14e04f").call()).liquidationThreshold) / 10000
        const liqudationThresholdForCvx = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b").call()).liquidationThreshold) / 10000
        const liqudationThresholdForOneinch = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x111111111117dc0aa78b770fa6a738034120c302").call()).liquidationThreshold) / 10000
        const liqudationThresholdForLusd = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x5f98805A4E8be255a32880FDeC7F6728C6568bA0").call()).liquidationThreshold) / 10000
        const liqudationThresholdForWbtc = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x2260fac5e5542a773aa44fbcfedf7c193bc2c599").call()).liquidationThreshold) / 10000
        const liqudationThresholdForWeth = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2").call()).liquidationThreshold) / 10000
        const liqudationThresholdForYfi = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e").call()).liquidationThreshold) / 10000
        const liqudationThresholdForZrx = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0xe41d2489571d322189246dafa5ebde1f4699f498").call()).liquidationThreshold) / 10000
        const liqudationThresholdForUni = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x1f9840a85d5af5bf1d1762f925bdaddc4201f984").call()).liquidationThreshold) / 10000
        const liqudationThresholdForAave = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9").call()).liquidationThreshold) / 10000
        const liqudationThresholdForBat = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x0d8775f648430679a709e98d2b0cb6250d2887ef").call()).liquidationThreshold) / 10000
        const liqudationThresholdForDai = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x6b175474e89094c44da98b954eedeac495271d0f").call()).liquidationThreshold) / 10000
        const liqudationThresholdForEnj = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c").call()).liquidationThreshold) / 10000
        const liqudationThresholdForKnc = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0xdd974d5c2e2928dea5f71b9825b8b646686bd200").call()).liquidationThreshold) / 10000
        const liqudationThresholdForLink = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x514910771af9ca656af840dff83e8264ecf986ca").call()).liquidationThreshold) / 10000
        const liqudationThresholdForMana = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x0f5d2fb29fb7d3cfee444a200298f468908cc942").call()).liquidationThreshold) / 10000
        const liqudationThresholdForMkr = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2").call()).liquidationThreshold) / 10000
        const liqudationThresholdForRen = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0x408e41876cccdc0f92210600ef50372656052a38").call()).liquidationThreshold) / 10000
        const liqudationThresholdForSnx = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData("0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f").call()).liquidationThreshold) / 10000


        // let supplied = position.metadata.supplied.map((supply) => {
        //     let balance = supply.balance;
        //     let liqudationThreshold = supply.liqudationThreshold;
        //     let price = supply.price;
        //     return balance * liqudationThreshold * price;
        // })
        //
        // let borrowed = position.metadata.borrowed.map((borrow) => {
        //     let balance = borrow.balance;
        //     let price = borrow.price;
        //     return balance * price;
        // })
        //
        // let suppliedSum = _.sum(supplied);
        // let borrowedSum = _.sum(borrowed);
        //
        // return suppliedSum / borrowedSum
        return 0

    } catch (error) {
        throw error
    }
}

async function defaultHealthFactor(position, web3) {
    try {
        const aaveV2ProtocolDataProvider = new web3.eth.Contract(AAVE_V2_PROTOCOL_DATA_PROVIDER_ABI, aaveV2ProtocolDataProviderContract)

        for (const supply of position.metadata.supplied) {
            const underlying = supply.underlying
            const balance = supply.balance
            const price = supply.price
            const ethPrice = await priceLib.getPriceFromAavePriceOracle([underlying], web3)
            const liqudationThreshold = parseFloat((await aaveV2ProtocolDataProvider.methods.getReserveConfigurationData(underlying).call()).liquidationThreshold) / 10000

        }

    } catch (error) {
        throw error
    }
}

module.exports = {
    calculateHealthFactor: calculateHealthFactor
}

// {
//     "positionId": "aave_v2-ETH-lending-0xb63e8a8d04999500a97470769d10c4395789836d",
//     "__v": 0,
//     "chain": "ETH",
//     "createdAt": {
//     "$date": "2023-11-28T13:35:37.883Z"
// },
//     "group": "lending",
//     "isSafe": true,
//     "metadata": {
//     "borrowed": [
//         {
//             "token": "0x619beb58998ed2278e08620f97007e1116d5d25b",
//             "balance": 108497.668814,
//             "underlying": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
//             "symbol": "USDC"
//         }
//     ],
//         "supplied": [
//         {
//             "token": "0x028171bca77440897b824ca71d1c56cac55b68a3",
//             "balance": 0.00028578441805119,
//             "underlying": "0x6b175474e89094c44da98b954eedeac495271d0f",
//             "symbol": "DAI"
//         },
//         {
//             "token": "0x9a14e23a58edf4efdcb360f68cd1b95ce2081a2f",
//             "balance": 224.2077575644477,
//             "underlying": "0xc18360217d8f7ab5e7c516566761ea12ce7f9d72",
//             "symbol": "ENS"
//         },
//         {
//             "token": "0x030ba81f1c18d280636f32af80b9aad02cf0854e",
//             "balance": 206.10337309472408,
//             "underlying": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
//             "symbol": "WETH"
//         }
//     ],
//         "healthFactor": 3.8683249995745093,
//         "totalSuppliedValue": 207.00069827767385,
//         "totalBorrowedValue": 45.820581513987456,
//         "totalUsdValue": 598222.9413218026,
//         "totalEthValue": 252.8212797916613
// },
//     "owner": "0xb63e8a8d04999500a97470769d10c4395789836d",
//     "protocolId": "aave_v2",
//     "updatedAt": {
//     "$date": "2023-12-08T13:28:14.716Z"
// }
// }

/*
function calculateHealthFactor(position) {
    try {
        let supplied = position.metadata.supplied.map((supply) => {
            let balance = supply.balance;
            let liqudationThreshold = supply.liqudationThreshold;
            let price = supply.price;
            return balance * liqudationThreshold * price;
        })

        let borrowed = position.metadata.borrowed.map((borrow) => {
            let balance = borrow.balance;
            let price = borrow.price;
            return balance * price;
        })

        let suppliedSum = _.sum(supplied);
        let borrowedSum = _.sum(borrowed);

        return suppliedSum / borrowedSum

    } catch (error) {
        consoleLib.logError(error);
    }
}
 */