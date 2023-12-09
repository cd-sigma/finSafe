const erc20Abi = require("../../../../abi/erc20.abi.json");
const lendingPoolAbi = require("../../abi/lending.pool.abi.json");
const LENDING_POOL_ADDRESS = "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9";

const dpLib = require("../../../../lib/dp.lib");
const aaveV2Config = require("../../../../config/aave.v2.config");
const alertLib = require("../../../../lib/alert.lib");
const priceLib = require("../../../../lib/price.lib");
const dpEnum = require("../../../../enum/dp.enum");

module.exports = async function updatePosition(position, web3) {
    try {
        let owner = position.owner;
        const lendingPoolContract = new web3.eth.Contract(lendingPoolAbi, LENDING_POOL_ADDRESS)

        let {healthFactor} = await lendingPoolContract.methods.getUserAccountData(owner).call();
        healthFactor = healthFactor / 10 ** 18;

        let oldHealthFactor = position.metadata.healthFactor;
        let aaveV2HealthFactorThreshold = await dpLib.getDp(dpEnum.AAVE_V2_HEALTH_FACTOR_THRESHOLD, aaveV2Config.defaultHealthFactorThreshold);
        aaveV2HealthFactorThreshold = parseFloat(aaveV2HealthFactorThreshold);
        if (oldHealthFactor && oldHealthFactor > aaveV2HealthFactorThreshold && healthFactor < aaveV2HealthFactorThreshold) {
            await alertLib.generateAlert(position.owner, "Aave V2 Health Factor Threshold Crossed", `Your health factor has dropped below ${aaveV2HealthFactorThreshold} on Aave V2! Current Health Factor: ${healthFactor}`);
        }
        if (oldHealthFactor && oldHealthFactor < aaveV2HealthFactorThreshold && healthFactor > aaveV2HealthFactorThreshold) {
            await alertLib.generateAlert(position.owner, "Aave V2 Health Factor Threshold Crossed", `Your health factor has risen above ${aaveV2HealthFactorThreshold} on Aave V2! Current Health Factor: ${healthFactor}`);
        }
        position.metadata.healthFactor = healthFactor;

        let balanceCalls = [], tokenContract = null, balances = null, decimalCalls = [], decimals = null,
            underlyingTokens = new Set();
        if (position.metadata.supplied) {
            balanceCalls = [];
            decimalCalls = [];
            position.metadata.supplied.forEach(asset => {
                tokenContract = new web3.eth.Contract(erc20Abi, asset.token);
                balanceCalls.push(tokenContract.methods.balanceOf(owner).call());
                decimalCalls.push(tokenContract.methods.decimals().call());
                underlyingTokens.add(asset.underlying);
            });
            balances = await Promise.all(balanceCalls);
            decimals = await Promise.all(decimalCalls);

            position.metadata.supplied.forEach((asset, index) => {
                asset.balance = balances[index] / 10 ** decimals[index];
            })
        }

        if (position.metadata.borrowed) {
            balanceCalls = [];
            decimalCalls = [];
            position.metadata.borrowed.forEach(asset => {
                tokenContract = new web3.eth.Contract(erc20Abi, asset.token);
                balanceCalls.push(tokenContract.methods.balanceOf(owner).call());
                decimalCalls.push(tokenContract.methods.decimals().call());
                underlyingTokens.add(asset.underlying);
            });
            balances = await Promise.all(balanceCalls);
            decimals = await Promise.all(decimalCalls);

            position.metadata.borrowed.forEach((asset, index) => {
                asset.balance = balances[index] / 10 ** decimals[index];
            })
        }

        let priceMap = {};
        underlyingTokens = Array.from(underlyingTokens);
        let underlyingAssetPrices = underlyingTokens.length > 0 ? await priceLib.getPriceFromAavePriceOracle(underlyingTokens, web3) : [];

        underlyingTokens.forEach((token, index) => {
            priceMap[token] = parseInt(underlyingAssetPrices[index]) / 10 ** 18;
        });

        let totalSuppliedValue = 0;
        if (position.metadata.supplied) {
            position.metadata.supplied.forEach(asset => {
                totalSuppliedValue += asset.balance * priceMap[asset.underlying];
            });
        }

        let totalBorrowedValue = 0;
        if (position.metadata.borrowed) {
            position.metadata.borrowed.forEach(asset => {
                totalBorrowedValue += asset.balance * priceMap[asset.underlying];
            })
        }

        let totalEthValue = totalSuppliedValue + totalBorrowedValue;
        let totalUsdValue = await priceLib.convertEthAmountToUsd(totalEthValue, web3);
        position.metadata.totalSuppliedValue = totalSuppliedValue;
        position.metadata.totalBorrowedValue = totalBorrowedValue;
        position.metadata.totalUsdValue = totalUsdValue;
        position.metadata.totalEthValue = totalEthValue;

        healthFactor < 1 ? position.isSafe = false : position.isSafe = true;
        return position
    } catch (error) {
        console.log(position.owner);
        throw error
    }
}