require("../node/node.env");
const _ = require("lodash");
const serviceConfig = require("../config/service.config");

const dpLib = require("../lib/dp.lib");
const mongoLib = require("../lib/mongo.lib");
const web3Lib = require("../lib/web3.lib");
const syncLib = require("../lib/sync.lib");
const consoleLib = require("../lib/console.lib");
const helperUtil = require("../util/helper.util");

const positionModel = require("../model/position.model");
const triggerPointModel = require("../model/trigger.point.model");
const dpEnum = require("../enum/dp.enum");

(async () => {
    try {
        await mongoLib.connect(process.env.MONGO_URL);
        let web3 = await web3Lib.getWebSocketWeb3Instance(process.env.ETH_NODE_WS_URL);

        let sync = await syncLib.getSync(serviceConfig.chainTracker.eth.chain, serviceConfig.chainTracker.eth.syncName)
        if (!sync) {
            throw new Error(`sync not found for ${serviceConfig.chainTracker.eth.chain} ${serviceConfig.chainTracker.eth.syncName}`);
        }

        if (_.isEmpty(sync.data) || _.isNil(sync.data.lastProcessedBlock)) {
            throw new Error(`sync validation failed for ${serviceConfig.chainTracker.eth.chain} ${serviceConfig.chainTracker.eth.syncName}`);
        }

        let startBlock = sync.data.lastProcessedBlock, endBlock = await web3.eth.getBlockNumber(), isProcessing = true,
            latestBlock = null, transactionReceipts = null, logs = null, triggerPointCheckCalls = null,
            triggerPointsList = null, processLogCalls = null, dbOperations = null, blockStartTime = null,
            isServiceEnabled = null;


        while (true) {
            if (isProcessing) {
                for (let iterBlock = startBlock; iterBlock <= endBlock; iterBlock++) {
                    isServiceEnabled = await dpLib.getDp(
                        dpEnum.ETH_CHAIN_TRACK_SERVICE_ENABLED,
                        serviceConfig.chainTracker.eth.serviceEnabledByDefault,
                    )
                    if (!isServiceEnabled) {
                        consoleLib.logWarn("service disabled")
                        await helperUtil.sleep(serviceConfig.chainTracker.eth.sleepTime)
                        iterBlock--
                        continue
                    }

                    blockStartTime = Date.now();
                    transactionReceipts = await web3Lib.getTransactionReceiptsForBlock(iterBlock, web3);
                    logs = web3Lib.extractLogsFromReceipts(transactionReceipts, web3);
                    logs = logs.filter((log) => log.address && log.topics.length >= 1);

                    triggerPointCheckCalls = [];
                    logs.forEach((log) => {
                        triggerPointCheckCalls.push(
                            mongoLib.findByQuery(triggerPointModel, {
                                topic0: log.topics[0].toLowerCase(),
                                contractAddress: log.address.toLowerCase()
                            })
                        )
                    })
                    triggerPointsList = await Promise.all(triggerPointCheckCalls);

                    processLogCalls = [];
                    triggerPointsList.forEach((triggerPointList, index) => {
                        if (!_.isEmpty(triggerPointList)) {
                            triggerPointList.forEach((triggerPoint) => {
                                processLogCalls.push(
                                    require(`../protocols/${triggerPoint.protocolId}/${triggerPoint.chain}/${triggerPoint.group}/process.log.js`)(logs[index], web3)
                                )
                            })
                        }
                    });
                    dbOperations = await Promise.all(processLogCalls);
                    dbOperations = _.flattenDeep(dbOperations);

                    if (!_.isEmpty(dbOperations)) {
                        await mongoLib.bulkWrite(positionModel, dbOperations);
                    }


                    consoleLib.logInfo({
                        message: `processed block`,
                        blockNumber: iterBlock,
                        transactionCount: transactionReceipts.length,
                        logCount: logs.length,
                        dbOperationCount: dbOperations.length,
                        timeTaken: (Date.now() - blockStartTime) / 1000 + " seconds"
                    });

                    await syncLib.updateSync(serviceConfig.chainTracker.eth.chain, serviceConfig.chainTracker.eth.syncName, {
                        lastProcessedBlock: iterBlock
                    });
                }
            }

            latestBlock = await web3.eth.getBlockNumber();

            if (latestBlock > endBlock) {
                startBlock = endBlock + 1;
                endBlock = latestBlock;
                isProcessing = true;
            } else {
                await helperUtil.sleep(serviceConfig.chainTracker.eth.sleepTime);
                isProcessing = false;
            }
        }
    } catch (error) {
        consoleLib.logError({error});
        process.exit(1);
    }
})();
