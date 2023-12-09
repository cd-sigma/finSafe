require("../node/node.env");

const dpLib = require("../lib/dp.lib");
const cmtLib = require("../lib/cmt.lib");
const web3Lib = require("../lib/web3.lib");
const mongoLib = require("../lib/mongo.lib");
const consoleLib = require("../lib/console.lib");
const helperUtil = require("../util/helper.util");

const serviceConfig = require("../config/service.config");
const cmtOrderModel = require("../model/cmt.order.model");
const dpEnum = require("../enum/dp.enum");

(async () => {
    try {
        await mongoLib.connect(process.env.MONGO_URL);
        const web3 = web3Lib.getWebSocketWeb3Instance(process.env.ETH_NODE_WS_URL);

        let orders = [], orderProcessingBatchLimit = null;
        while (true) {
            orderProcessingBatchLimit = await dpLib.getDp(dpEnum.CMT_ORDER_PROCESSING_LIMIT, serviceConfig.cmtOrderExecutor.defaultBatchProcessingLimit);
            orderProcessingBatchLimit = parseInt(orderProcessingBatchLimit);

            orders = await mongoLib.findByQueryWithSkipLimit(cmtOrderModel, {
                isExecuted: false,
                isFailed: false,
            }, orderProcessingBatchLimit, 0);

            if (orders.length === 0) {
                const sleepTime = await dpLib.getDp(dpEnum.CMT_ORDER_PROCESSING_SLEEP_TIME, serviceConfig.cmtOrderExecutor.defaultSleepTime);
                consoleLib.logInfo(`No orders found to be executed!`);
                await helperUtil.sleep(sleepTime);
                continue;
            }

            let orderExecutionCalls = [];
            orders.forEach((order) => {
                orderExecutionCalls.push(cmtLib.executeOrder(order, web3));
            })
            let orderExecutionResults = await Promise.allSettled(orderExecutionCalls);

            let orderUpdateCalls = [], successfulOrdersCount = 0, failedOrdersCount = 0;
            orders.forEach((order, iterOrder) => {
                if (orderExecutionResults[iterOrder].status === "fulfilled") {
                    successfulOrdersCount++;
                    orderUpdateCalls.push(mongoLib.findOneAndUpdate(cmtOrderModel, {_id: order._id}, {isExecuted: true}));
                } else {
                    failedOrdersCount++;
                    orderUpdateCalls.push(mongoLib.findOneAndUpdate(cmtOrderModel, {_id: order._id}, {isFailed: true}));
                }
            });
            await Promise.all(orderUpdateCalls);

            consoleLib.logInfo({
                msg: "Order execution completed!",
                ordersLength: orders.length,
                successfulOrders: successfulOrdersCount,
                failedOrders: failedOrdersCount
            });

            const sleepTime = await dpLib.getDp(dpEnum.CMT_ORDER_PROCESSING_SLEEP_TIME, serviceConfig.cmtOrderExecutor.defaultSleepTime);
            await helperUtil.sleep(sleepTime);
        }
    } catch (error) {
        consoleLib.logError(error);
        process.exit(1);
    }
})();