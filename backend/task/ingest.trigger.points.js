
require("../node/node.env");
const fs = require('fs');
const _ = require('lodash');
const dirTree = require("directory-tree");

const mongoLib = require('../lib/mongo.lib');
const consoleLib = require('../lib/console.lib');

const triggerPointModel = require('../model/trigger.point.model');

async function ingest(protocolId, chain, group) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!fs.existsSync(`../protocols/${protocolId}/${chain}/${group}/config.json`)) {
                throw new Error(`config.json file not found in ../protocols/${protocolId}/${chain}/${group}/`);
            }

            let config = require(`../protocols/${protocolId}/${chain}/${group}/config.json`);
            let contracts = config.contracts;
            let dbWriteCalls = [];
            contracts.forEach(contract => {
                let events = contract.events;
                events.forEach(event => {
                    let triggerPoint = {
                        protocolId: protocolId,
                        chain: chain,
                        group: group,
                        contractAddress: contract.address.toLowerCase(),
                        topic0: event.topic0.toLowerCase(),
                    }
                    dbWriteCalls.push({
                        updateOne: {
                            filter: {
                                protocolId: protocolId,
                                chain: chain,
                                group: group,
                                contractAddress: contract.address.toLowerCase(),
                                topic0: event.topic0.toLowerCase(),
                            },
                            update: {
                                $set: triggerPoint
                            },
                            upsert: true
                        }
                    })
                });
            })
            await mongoLib.bulkWrite(triggerPointModel, dbWriteCalls);

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

async function ingestAll() {
    return new Promise(async (resolve, reject) => {
        try {
            let protocols = dirTree("../protocols");

            let ingestCalls = []
            for (const protocol of protocols.children) {
                for (const chain of protocol.children) {
                    for (const group of chain.children) {
                        if (fs.existsSync(`../protocols/${protocol.name}/${chain.name}/${group.name}/config.json`)) {
                            ingestCalls.push(ingest(protocol.name, chain.name, group.name));
                        }
                    }
                }
            }
            await Promise.all(ingestCalls);

            resolve();
        } catch (error) {
            reject(error);
        }
    })
}

(async () => {
    try {
        await mongoLib.connect(process.env.MONGO_URL);

        let protocolId = process.argv[2];
        let chain = process.argv[3];
        let group = process.argv[4];

        if (_.isEmpty(protocolId) && _.isEmpty(chain) && _.isEmpty(group)) {
            await ingestAll();
        }

        if (!_.isEmpty(protocolId) && !_.isEmpty(chain) && !_.isEmpty(group)) {
            await ingest(protocolId, chain, group);
        }

        consoleLib.logInfo('Ingestion completed ✅');
    } catch (error) {
        consoleLib.logError(error);
        process.exit(1);
    }
})();