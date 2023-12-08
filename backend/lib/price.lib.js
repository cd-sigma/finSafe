const _ = require('lodash');

const chainlinkPriceOracleAbi = require('../abi/chainlink.oracle.abi.json');
const aaveV2PriceOracleAbi = require('../abi/aave.v2.price.oracle.abi.json');

const chainConfig = require('../config/chain.config');
const priceConfig = require('../config/price.config.json');
const globalConst = require('../global.const');
const PRICE_NOT_AVAILABLE = 0;

//INFO: only provides prices for assets in ethereum for now
async function getPriceFromAavePriceOracle(assets, web3, blockNumber = "latest") {
    return new Promise(async (resolve, reject) => {
        try {
            if (_.isEmpty(assets)) {
                throw new Error("Assets is empty");
            }

            if (_.isEmpty(web3)) {
                throw new Error("Web3 is empty");
            }

            const aavePriceOracleContract = new web3.eth.Contract(aaveV2PriceOracleAbi, globalConst.AAVE_V2_PRICE_ORACLE_ADDRESS);
            aavePriceOracleContract.defaultBlock = blockNumber;

            let prices = await aavePriceOracleContract.methods.getAssetsPrices(assets).call();

            resolve(prices);
        } catch (error) {
            reject(error);
        }
    })
}

//gets native coin price in terms of USD from chainlink oracle (by default from latest block)
async function getNativePriceFromChainlinkPriceOracle(chain, web3, blockNumber = "latest") {
    return new Promise(async (resolve, reject) => {
        try {
            let chainId = await web3.eth.getChainId()

            //validate the required fields
            if (_.isEmpty(chain)) {
                throw new Error(`Please specify the chain!`)
            }

            if (_.isEmpty(web3)) {
                throw new Error(`Please pass the provider!`)
            }

            //uniform case for chain
            chain = chain.toLowerCase()

            //check if the chain is integrated
            if (!Object.keys(priceConfig.oracles).includes(chain)) {
                resolve({
                    usdPrice: PRICE_NOT_AVAILABLE,
                    reason: `Chain ${chain} is not integrated!`,
                })
                return
            }

            //check if the provider is of the same chain as specified
            if (chainId !== chainConfig.chainIds[chain]) {
                throw new Error(
                    `Please pass the correct web3 provider! current provider chainId:${chainId} `,
                )
            }

            const oracle = new web3.eth.Contract(
                chainlinkPriceOracleAbi,
                priceConfig.oracles[chain]["0xnative"],
            )

            //set the block number to get the price from
            oracle.defaultBlock = blockNumber

            //get the price of the native coin from corresponding chainlink oracle
            let price = await oracle.methods.latestAnswer().call()
            let decimals = await oracle.methods.decimals().call()
            price = price / 10 ** decimals

            resolve({usdPrice: price})
        } catch (error) {
            reject(error)
        }
    })
}

//gets price of tokens in terms of USD from chainlink oracles (by default from latest block)
async function getTokenPriceFromChainlinkPriceOracle(chain, tokenAddress, web3, blockNumber = "latest") {
    return new Promise(async (resolve, reject) => {
        try {
            let price
            let chainId = await web3.eth.getChainId()

            //validate the required fields
            if (_.isEmpty(chain) || _.isEmpty(tokenAddress)) {
                throw new Error(`Values of chain : ${chain} tokenAddress: ${tokenAddress}`)
            }

            if (_.isEmpty(web3)) {
                throw new Error(`Please pass the provider!`)
            }

            //uniform case for chain and tokenAddress
            chain = chain.toLowerCase()
            tokenAddress = tokenAddress.toLowerCase()

            //check if the chain is integrated
            if (!Object.keys(priceConfig.oracles).includes(chain)) {
                resolve({
                    usdPrice: PRICE_NOT_AVAILABLE,
                    reason: `Chain ${chain} is not integrated!`,
                })
            }

            //check if the provider is of the same chain as specified
            if (chainId !== chainConfig.chainIds[chain]) {
                throw new Error(
                    `Please pass the correct web3 provider! current provider chainId:${chainId} `,
                )
            }

            //check if the token address corresponds to a chainlink oracle
            if (Object.keys(priceConfig.oracles[chain]).includes(tokenAddress)) {
                let oracle = new web3.eth.Contract(
                    chainlinkPriceOracleAbi,
                    priceConfig.oracles[chain][tokenAddress],
                )

                //set the block number to get the price from
                oracle.defaultBlock = blockNumber

                let rawPrice = await oracle.methods.latestAnswer().call()
                let decimals = await oracle.methods.decimals().call()
                let desc = await oracle.methods.description().call()

                //check if the price is in terms of USD or native coin of the blockchain
                if (desc.substring(desc.indexOf("/") + 2) === "USD") {
                    price = rawPrice / 10 ** decimals
                }
                    //if the price is in terms of native coin, get the price of the native coin and calculate the price by
                //by multiplying th raw price with native coin price
                else {
                    let nativePrice = await getNativePriceFromChainlinkPriceOracle(chain, web3, blockNumber)
                    price = (rawPrice / 10 ** decimals) * nativePrice.usdPrice
                }
            }
            //if the token address doesnt correspond to a chainlink oracle, return price as 0
            else {
                resolve({
                    usdPrice: PRICE_NOT_AVAILABLE,
                    reason: `Token ${tokenAddress} is not integrated on chain ${chain}!`,
                })
                return
            }

            resolve({usdPrice: price})
        } catch (error) {
            reject(error)
        }
    })
}

async function convertEthAmountToUsd(ethAmount,web3) {
    return new Promise(async (resolve, reject) => {
        try {
            let ethPrice= await getNativePriceFromChainlinkPriceOracle("eth",web3);
            let usdAmount = ethAmount * ethPrice.usdPrice;
            resolve(usdAmount)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    getPriceFromAavePriceOracle: getPriceFromAavePriceOracle,
    getTokenPriceFromChainlinkPriceOracle: getTokenPriceFromChainlinkPriceOracle,
    getNativePriceFromChainlinkPriceOracle: getNativePriceFromChainlinkPriceOracle,
    convertEthAmountToUsd:convertEthAmountToUsd
}