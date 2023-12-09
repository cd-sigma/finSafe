require("dotenv").config({path: "../../.env"});
const _ = require("lodash");

const mongoLib = require('../../lib/mongo.lib');
const web3Lib = require('../../lib/web3.lib');
const alertLib = require('../../lib/alert.lib');
const redisLib = require('../../lib/redis.lib');
const consoleLib = require('../../lib/console.lib');

const TRANSMIT_METHOD_ID = "0xc9807539";
const serviceConfig = require('../../configs/service.config');
const positionModel = require('../../models/position.model');
const wtfLogTypeEnum = require('../../enums/wtf.log.types.enum');
const positionVulnerabilityEnum = require('../../enums/position.vulnerability.enum');

const aaveV2OracleConfig = require('../../configs/aave.v2.oracle.json');
const aggregators = aaveV2OracleConfig.map((oracle) => oracle.aggregatorAddress.toLowerCase());
const PRICE_ORACLE_CONTRACT = "0xa50ba011c48153de246e5192c8f9258a2ba79ca9"
const PROTOCOL_DATA_PROVIDER = "0x057835ad21a177dbdd3090bb1cae03eacf78fc6d"

//check oracle for ens and weth and xsushi

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


(async () => {
    try {
        await mongoLib.connect(process.env.MONGO_URL);
        await redisLib.connect(process.env.REDIS_URL);

        const web3 = web3Lib.getWebSocketWeb3Instance(process.env.ETH_NODE_WS_URL);

        web3.eth.subscribe('pendingTransactions', async (error, txHash) => {
            let txnData = await web3.eth.getTransaction(txHash);
            if (txnData && txnData.to && aggregators.includes(txnData.to.toLowerCase()) && txnData.input && txnData.input.slice(0, 10).toLowerCase() === TRANSMIT_METHOD_ID) {
                let oracle = aaveV2OracleConfig.find((oracle) => oracle.aggregatorAddress.toLowerCase() === txnData.to.toLowerCase());
                let underlyingAsset = oracle.underlyingAsset;

                let decodedParams = web3.eth.abi.decodeParameters(["bytes", "bytes32[]", "bytes32[]", "bytes32"], "0x" + txnData.input.slice(10));
                let decodedReport = web3.eth.abi.decodeParameters(["bytes32", "bytes32", "uint192[]"], decodedParams[0]);
                let obs = decodedReport[2];
                let newPrice = obs[parseInt(obs.length / 2)] / 10 ** 18; //TODO: store aggregator decimals in config

                let mongoStartTime = Date.now();
                let positionOfUnderlyingAssetInDanger = await mongoLib.findByQuery(positionModel,
                    {
                        $or: [
                            {"metadata.supplied.underlying": underlyingAsset},
                            {"metadata.borrowed.underlying": underlyingAsset}
                        ],
                        vulnerability: positionVulnerabilityEnum.HIGH
                    }
                );

                let dangreousPositions = [];
                positionOfUnderlyingAssetInDanger.forEach((position) => {
                    calculateHealthFactor(position) < 1 && dangreousPositions.push(position);
                })


                await alertLib.oracleUpdateAlert(
                    txnData.to,
                    oracle.desc,
                    txnData.hash,
                    newPrice,
                    positionOfUnderlyingAssetInDanger.length,
                    positionOfUnderlyingAssetInDanger.map((position) => position.owner),
                    (Date.now() - mongoStartTime) / 1000,
                )
            }
        })
    } catch (error) {
        consoleLib.logError(error);
        await alertLib.wtfAlert(serviceConfig.aaveLiquidator.serviceName, __filename, error, wtfLogTypeEnum.AAVE_LIQUIDATOR_SERVICE_FAILED)
        process.exit(1);
    }
})();

/**
 * Paste one or more documents here
 */
// {
//     "positionId": "aave_v2-ETH-lending-0xd75a171548b737783cae2a3123b50379c38d14ea",
//     "__v": 0,
//     "chain": "ETH",
//     "createdAt": {
//     "$date": "2023-11-28T13:35:38.243Z"
// },
//     "group": "lending",
//     "isSafe": true,
//     "metadata": {
//     "borrowed": [
//         {
//             "token": "0x531842cebbdd378f8ee36d171d6cc9c4fcf475ec",
//             "balance": 3130.375381,
//             "underlying": "0xdac17f958d2ee523a2206206994597c13d831ec7",
//             "symbol": "USDT"
//         },
//         {
//             "token": "0x619beb58998ed2278e08620f97007e1116d5d25b",
//             "balance": 507571.170478,
//             "underlying": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
//             "symbol": "USDC"
//         },
//         {
//             "token": "0x6c3c78838c761c6ac7be9f59fe808ea2a6e4379d",
//             "balance": 390776.0018851623,
//             "underlying": "0x6b175474e89094c44da98b954eedeac495271d0f",
//             "symbol": "DAI"
//         }
//     ],
//         "supplied": [
//         {
//             "token": "0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656",
//             "balance": 0.04345675,
//             "underlying": "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
//             "symbol": "WBTC"
//         },
//         {
//             "token": "0x030ba81f1c18d280636f32af80b9aad02cf0854e",
//             "balance": 826.1031965669534,
//             "underlying": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
//             "symbol": "WETH"
//         },
//         {
//             "token": "0x028171bca77440897b824ca71d1c56cac55b68a3",
//             "balance": 4.359585533392954,
//             "underlying": "0x6b175474e89094c44da98b954eedeac495271d0f",
//             "symbol": "DAI"
//         },
//         {
//             "token": "0xbcca60bb61934080951369a648fb03df4f96263c",
//             "balance": 8.370754,
//             "underlying": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
//             "symbol": "USDC"
//         },
//         {
//             "token": "0x1982b2f5814301d4e9a8b0201555376e62f82428",
//             "balance": 1e-18,
//             "underlying": "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
//             "symbol": "stETH"
//         }
//     ],
//         "healthFactor": 1.8650456698586677,
//         "totalSuppliedValue": 826.9031377601987,
//         "totalBorrowedValue": 381.2528666999765,
//         "totalUsdValue": 2858725.4963638578,
//         "totalEthValue": 1208.1560044601752
// },
//     "owner": "0xd75a171548b737783cae2a3123b50379c38d14ea",
//     "protocolId": "aave_v2",
//     "updatedAt": {
//     "$date": "2023-12-08T13:28:14.716Z"
// }
// }