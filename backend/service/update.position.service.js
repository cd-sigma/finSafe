require("../node/node.env");
const fs = require("fs");
const _ = require("lodash");
const serviceConfig = require("../config/service.config");

const dpLib = require("../lib/dp.lib");
const mongoLib = require("../lib/mongo.lib");
const syncLib = require("../lib/sync.lib");
const web3Lib = require("../lib/web3.lib");
const dateUtil = require("../util/date.util");
const consoleLib = require("../lib/console.lib");
const helperUtil = require("../util/helper.util");

const positionModel = require("../model/position.model");
const dpEnum = require("../enum/dp.enum");

(async()=>{
        try {
            await mongoLib.connect(process.env.MONGO_URL);
            let web3 = await web3Lib.getWebSocketWeb3Instance(process.env.ETH_NODE_WS_URL);

            let positions = [], positionUpdateCalls = [], updatedPositions = [], dbWriteCalls = [], updateFn = null,
                limit = serviceConfig.positionUpdators.eth.batchSize, startTime = null,
                totalPositions = await mongoLib.getCountForModel(positionModel), isServiceEnabled = null;

            let sync = await syncLib.getSync(serviceConfig.positionUpdators.eth.chain, serviceConfig.positionUpdators.eth.syncName);
            let skip = sync && sync.data && sync.data.offset ? sync.data.offset : 0;

            while (true) {
                isServiceEnabled = await dpLib.getDp(
                    dpEnum.ETH_POSITION_UPDATOR_SERVICE_ENABLED,
                    serviceConfig.positionUpdators.eth.serviceEnabledByDefault
                )
                if (!isServiceEnabled) {
                    consoleLib.logWarn("service disabled")
                    await helperUtil.sleep(serviceConfig.positionUpdators.eth.sleepTime)
                    continue
                }

                startTime = dateUtil.getCurrentTimestamp();
                positions = await mongoLib.findByQueryWithSkipLimit(positionModel, {}, limit, skip);

                if (_.isEmpty(positions)) {
                    skip = 0;
                    totalPositions = await mongoLib.getCountForModel(positionModel);

                    consoleLib.logInfo({
                        "msg": "firing up updator service from the beginning!"
                    })
                    continue;
                }

                positionUpdateCalls = [];
                positions.forEach((position) => {
                    if (!fs.existsSync(`../protocols/${position.protocolId}/${position.chain}/${position.group}/update.position.js`)) {
                        throw new Error(`update.position.js file not found for ${position.protocolId} ${position.chain} ${position.group}`);
                    }

                    updateFn = require(`../protocols/${position.protocolId}/${position.chain}/${position.group}/update.position.js`);
                    positionUpdateCalls.push(updateFn(position, web3));
                });
                updatedPositions = await Promise.all(positionUpdateCalls);

                dbWriteCalls = [];
                updatedPositions.forEach((position) => {
                    dbWriteCalls.push({
                        updateOne: {
                            filter: {positionId: position.positionId}, update: {$set: position._doc}
                        }
                    })
                });
                await mongoLib.bulkWrite(positionModel, dbWriteCalls);

                skip += positions.length;
                await syncLib.updateSync(serviceConfig.positionUpdators.eth.chain, serviceConfig.positionUpdators.eth.syncName, {offset: skip});

                consoleLib.logInfo({
                    positionsUpdated: skip,
                    totalPositions: totalPositions,
                    timeTaken: (dateUtil.getCurrentTimestamp() - startTime) / 1000,
                    msg: "Updated positions successfully!"
                })

            }
        } catch (error) {
            consoleLib.logError({error});
            process.exit(1);
        }
})();