//WARNING: restarts not factored in, there will be some duplicate alerts in the db (fix it in future);

require("../node/node.env");
const _ = require('lodash');

const mongoLib = require('../lib/mongo.lib');
const syncLib = require('../lib/sync.lib');
const web3Lib = require('../lib/web3.lib');
const alertLib = require("../lib/alert.lib");
const consoleLib = require('../lib/console.lib');

const dateUtil = require('../util/date.util');
const errorUtil = require('../util/error.util');
const helperUtil = require("../util/helper.util");

const taskConfig = require('../config/task.config');
const erc20Abi = require("../abi/erc20.abi.json");
const aaveTokensTypeEnum = require("../enum/aave.tokens.type.enum");

const aaveV2Config = require("../config/aave.v2.config.json");
const aTokens = aaveV2Config.tokens.map((token) => token.aTokenAddress);
const stableDebtTokens = aaveV2Config.tokens.map((token) => token.stableDebtTokenAddress);
const variableDebtTokens = aaveV2Config.tokens.map((token) => token.variableDebtTokenAddress);

async function processLogAndGenerateAlert(log, web3) {
    try {
        let sender = helperUtil.removeLeadingZeroes(log.topics[1]).toLowerCase();
        let receiver = helperUtil.removeLeadingZeroes(log.topics[2]).toLowerCase();
        let transferredAmount = parseInt(log.data);

        let tokenAddress = log.address.toLowerCase()
        let tokenType = aTokens.includes(tokenAddress) ? aaveTokensTypeEnum.A_TOKEN : stableDebtTokens.includes(tokenAddress) ? aaveTokensTypeEnum.STABLE_DEBT_TOKEN : variableDebtTokens.includes(tokenAddress) ? aaveTokensTypeEnum.VARIABLE_DEBT_TOKEN : "unknown";
        let tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);
        let tokenDecimals = await tokenContract.methods.decimals().call();
        let block = await web3.eth.getBlock(log.blockNumber);
        let blockTimestamp = block.timestamp * 1000;
        transferredAmount = transferredAmount / (10 ** tokenDecimals);

        let senderMessage = null, senderTitle = null, receiverMessage = null, receiverTitle = null;
        switch (tokenType) {
            case aaveTokensTypeEnum.A_TOKEN:
                senderTitle = "Aave V2 Collateral Transferred";
                senderMessage = `You have withdrawn ${transferredAmount} ${aaveV2Config.tokens.find((token) => token.aTokenAddress === tokenAddress).symbol}  from your Aave V2 Collateral and transferred to ${receiver}`
                receiverTitle = "Aave V2 Collateral Received";
                receiverMessage = `You have received ${transferredAmount} ${aaveV2Config.tokens.find((token) => token.aTokenAddress === tokenAddress).symbol} of Aave V2 Collateral from ${sender}`
                break;
            case aaveTokensTypeEnum.STABLE_DEBT_TOKEN:
                senderTitle = "Aave V2 Stable Debt Transferred";
                senderMessage = `You have transferred ${transferredAmount} ${aaveV2Config.tokens.find((token) => token.stableDebtTokenAddress === tokenAddress).symbol}  of Aave V2 Stable Debt to ${receiver}`
                receiverTitle = "Aave V2 Stable Debt Received";
                receiverMessage = `You have received ${transferredAmount} ${aaveV2Config.tokens.find((token) => token.stableDebtTokenAddress === tokenAddress).symbol}  of Aave V2 Stable Debt from ${sender}`
                break;
            case aaveTokensTypeEnum.VARIABLE_DEBT_TOKEN:
                senderTitle = "Aave V2 Variable Debt Transferred";
                senderMessage = `You have transferred ${transferredAmount} ${aaveV2Config.tokens.find((token) => token.variableDebtTokenAddress === tokenAddress).symbol}  of Aave V2 Variable Debt to ${receiver}`
                receiverTitle = "Aave V2 Variable Debt Received";
                receiverMessage =  `You have received ${transferredAmount} ${aaveV2Config.tokens.find((token) => token.variableDebtTokenAddress === tokenAddress).symbol}  of Aave V2 Variable Debt from ${sender}`
                break;
            default:
                errorUtil.throwErr("Invalid token type detected");
        }
        await Promise.all([
            alertLib.generateAlert(sender, blockTimestamp, senderTitle, senderMessage),
            alertLib.generateAlert(receiver, blockTimestamp, receiverTitle, receiverMessage)
        ]);
    } catch (error) {
        throw error;
    }
}

async function getPastLogsAndExtractAlerts(web3, protocolId, chain, group, address, topic0, startBlock, processLogAndExtractAlerts) {
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
                    logProcessingCalls.push(processLogAndExtractAlerts(log, web3));

                    if (logProcessingCalls.length % 10 === 0 || logs[logs.length - 1] === log) {
                        await Promise.all(logProcessingCalls);
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

                await syncLib.updateSync(chain.toUpperCase(), `${protocolId.toLowerCase()}_${chain.toUpperCase()}_${group.toLowerCase()}_old_alerts`, {
                    lastAddressProcessed: address.toLowerCase(),
                    lastEventProcessed: topic0.toLowerCase(),
                    lastBlockProcessed: toBlock,
                    moveToNext: false
                })

                getLogsCalls = [];
            }
        }

        await syncLib.updateSync(chain.toUpperCase(), `${protocolId.toLowerCase()}_${chain.toUpperCase()}_${group.toLowerCase()}_old_alerts`, {
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
        let web3 = web3Lib.getWebSocketWeb3Instance(process.env.ETH_NODE_WS_URL);

        const protocolId = 'aave_v2', chain = 'ETH', group = 'lending';
        let sync = await syncLib.getSync(chain.toUpperCase(), `${protocolId.toLowerCase()}_${chain.toUpperCase()}_${group.toLowerCase()}_old_alerts`);

        let {contracts} = require(`../protocols/${protocolId}/${chain}/${group}/config.json`);

        let startingContractIndex = 0, startingEventIndex = 0;
        if (!sync) {
            await syncLib.updateSync(chain.toUpperCase(), `${protocolId.toLowerCase()}_${chain.toUpperCase()}_${group.toLowerCase()}_old_alerts`, {
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

        for (let iterContract = startingContractIndex; iterContract < contracts.length; iterContract++) {
            let address = contracts[iterContract].address;
            let events = contracts[iterContract].events;

            for (let iterEvent = startingEventIndex; iterEvent < events.length; iterEvent++) {
                let topic0 = events[iterEvent].topic0;

                sync = await syncLib.getSync(chain.toUpperCase(), `${protocolId.toLowerCase()}_${chain.toUpperCase()}_${group.toLowerCase()}_old_alerts`);

                let startBlock = null;
                if (sync && sync.data.moveToNext) {
                    startBlock = contracts[iterContract].startBlock;
                } else {
                    startBlock = sync.data.lastBlockProcessed
                }

                await getPastLogsAndExtractAlerts(web3, protocolId, chain, group, address, topic0, parseInt(startBlock), processLogAndGenerateAlert);
            }
        }

        await syncLib.updateSync(chain.toUpperCase(), `${protocolId.toLowerCase()}_${chain.toUpperCase()}_${group.toLowerCase()}_old_alerts`, {}, true,)
    } catch (error) {
        consoleLib.logError(error);
        process.exit(1);
    }
})();