const globalConst=require("../global.const");
const errorUtil = require("../util/error.util");
const validatorUtil = require("../util/validators.util");

const finsafeExecutorAbi= require("../abi/finsafe.executor.abi.json");

function validateOrder(order) {
    try {
        if (validatorUtil.isEmpty(order.ownerAddress) || validatorUtil.isEmpty(order.positionId) || validatorUtil.isEmpty(order.timestamp) || validatorUtil.isEmpty(order.collateralAddress) || validatorUtil.isEmpty(order.collateralAmount)) {
            return false;
        }
        return true;
    } catch (error) {
        throw error;
    }
}


async function executeOrder(order, web3) {
    try {
        if(validatorUtil.isEmpty(order) || validatorUtil.isEmpty(web3)) {
            errorUtil.throwErr("Invalid order or web3!");
        }

        if(!validateOrder(order)) {
            errorUtil.throwErr("Invalid order!");
        }

        const lendingPoolContract= new web3.eth.Contract(finsafeExecutorAbi, globalConst.FINSAFE_EXECUTOR_ADDRESS);
        //TODO: execute order
        // await lendingPoolContract.methods.executeOrder(order.ownerAddress, order.collateralAddress, order.collateralAmount)
    } catch (error) {
        throw error;
    }
}

module.exports = {
    executeOrder: executeOrder
}