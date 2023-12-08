require("../node/node.env");
const _ = require('lodash');

const mongoLib = require('../lib/mongo.lib');
const syncLib = require('../lib/sync.lib');
const web3Lib = require('../lib/web3.lib');
const dateUtil = require('../util/date.util');
const consoleLib = require('../lib/console.lib');

const errorUtil = require('../util/error.util');

const positionModel = require('../model/position.model');
const taskConfig = require('../config/task.config');

async function getPastLogsAndExtractPositions(web3, protocolId, chain, group, address, topic0, startBlock, processLog) {
    try {
        let latestBlock = await web3.eth.getBlockNumber(), getLogsCalls = [], fromBlock = null, toBlock = null,
            logs = null, logProcessingCalls = null, dbWriteCalls = null, batchStartTime = null;

        for (let iterBlock = startBlock; iterBlock <= latestBlock; iterBlock += taskConfig.protocolHistoryBuilder.blockProcessingBatchSize) {
            batchStartTime = dateUtil.getCurrentTimestamp();
            fromBlock = iterBlock;
            toBlock = iterBlock + taskConfig.protocolHistoryBuilder.blockProcessingBatchSize - 1;
            if (toBlock > latestBlock) {
                toBlock = latestBlock;
            }

            getLogsCalls.push(web3Lib.getPastLogs(address, [topic0], fromBlock, toBlock, web3));

            if (getLogsCalls.length % 10 === 0 || toBlock === latestBlock) {
                logs = await Promise.all(getLogsCalls);
                logs = _.flatten(logs);

                logProcessingCalls = [];
                for (const log of logs) {
                    logProcessingCalls.push(processLog(log, web3));

                    if (logProcessingCalls.length % 10 === 0 || logs[logs.length - 1] === log) {
                        dbWriteCalls = await Promise.all(logProcessingCalls);
                        dbWriteCalls = _.flatten(dbWriteCalls)

                        if (dbWriteCalls.length > 0) {
                            await mongoLib.bulkWrite(positionModel, dbWriteCalls);
                        }

                        logProcessingCalls = [];
                    }
                }


                consoleLib.logInfo({
                    address,
                    topic0,
                    lastBlockProcessed: toBlock,
                    logsFound: logs.length,
                    timeTaken: (dateUtil.getCurrentTimestamp() - batchStartTime) / 1000 + ' seconds'
                });

                await syncLib.updateSync(chain.toUpperCase(), `${protocolId.toLowerCase()}_${chain.toUpperCase()}_${group.toLowerCase()}`, {
                    lastAddressProcessed: address.toLowerCase(),
                    lastEventProcessed: topic0.toLowerCase(),
                    lastBlockProcessed: toBlock,
                    moveToNext: false
                })

                getLogsCalls = [];
            }
        }

        await syncLib.updateSync(chain.toUpperCase(), `${protocolId.toLowerCase()}_${chain.toUpperCase()}_${group.toLowerCase()}`, {
            lastAddressProcessed: address.toLowerCase(),
            lastEventProcessed: topic0.toLowerCase(),
            lastBlockProcessed: latestBlock,
            moveToNext: true
        })

    } catch (error) {
        throw error
    }
}

(async () => {
    try {
        await mongoLib.connect(process.env.MONGO_URL);

        if (process.argv && process.argv.length < 5) {
            errorUtil.throwErr(`Invalid arguments. Please pass protocolId, chain, groupId as the arguments to the script`);
        }

        let web3 = web3Lib.getWebSocketWeb3Instance(process.env.ETH_NODE_WS_URL);

        //we need to pass the protocolId, chain, groupId as the arguments to the script
        let protocolId = process.argv[2];
        let chain = process.argv[3];
        let group = process.argv[4];

        let sync = await syncLib.getSync(chain.toUpperCase(), `${protocolId.toLowerCase()}_${chain.toUpperCase()}_${group.toLowerCase()}`);

        let {contracts} = require(`../protocols/${protocolId}/${chain}/${group}/config.json`);

        let startingContractIndex = 0, startingEventIndex = 0;
        if (!sync) {
            await syncLib.updateSync(chain.toUpperCase(), `${protocolId.toLowerCase()}_${chain.toUpperCase()}_${group.toLowerCase()}`, {
                lastAddressProcessed: contracts[0].address.toLowerCase(),
                lastEventProcessed: contracts[0].events[0].topic0.toLowerCase(),
                lastBlockProcessed: contracts[0].startBlock,
                moveToNext: false
            }, false,)

            startingContractIndex = 0;
            startingEventIndex = 0;
        } else {
            startingContractIndex = contracts.findIndex(contract => contract.address.toLowerCase() === sync.data.lastAddressProcessed);
            startingEventIndex = contracts[startingContractIndex].events.findIndex(event => event.topic0.toLowerCase() === sync.data.lastEventProcessed);
        }

        let processLog = require(`../protocols/${protocolId}/${chain}/${group}/process.log.js`);

        for (let iterContract = startingContractIndex; iterContract < contracts.length; iterContract++) {
            let address = contracts[iterContract].address;
            let events = contracts[iterContract].events;

            for (let iterEvent = startingEventIndex; iterEvent < events.length; iterEvent++) {
                let topic0 = events[iterEvent].topic0;

                sync = await syncLib.getSync(chain.toUpperCase(), `${protocolId.toLowerCase()}_${chain.toUpperCase()}_${group.toLowerCase()}`);

                let startBlock = null;
                if (sync && sync.data.moveToNext) {
                    startBlock = contracts[iterContract].startBlock;
                } else {
                    startBlock = sync.data.lastBlockProcessed
                }

                await getPastLogsAndExtractPositions(web3, protocolId, chain, group, address, topic0, parseInt(startBlock), processLog);
            }
        }

        await syncLib.updateSync(chain.toUpperCase(), `${protocolId.toLowerCase()}_${chain.toUpperCase()}_${group.toLowerCase()}`, {}, true,)
    } catch (error) {
        consoleLib.logError(error);
        process.exit(1);
    }
})();