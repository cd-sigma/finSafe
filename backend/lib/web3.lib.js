const _ = require("lodash");
const Web3 = require("web3");
const axios = require("axios");

const errorUtil = require("../util/error.util");
const libConfig = require("../config/lib.config.json");

function getWebSocketWeb3Instance(url) {
    try {
        if (_.isEmpty(url)) {
            errorUtil.throwErr("url empty");
        }
        return new Web3(new Web3.providers.WebsocketProvider(url, {
            clientConfig: {
                maxReceivedFrameSize: 10000000000, maxReceivedMessageSize: 10000000000,
            },
        }));
    } catch (error) {
        throw error;
    }
}

async function getTransactionReceiptsForBlock(block, web3) {
    try {
        if (_.isNil(block)) {
            errorUtil.throwErr("block empty");
        }

        if (_.isEmpty(web3)) {
            errorUtil.throwErr("web3 instance empty");
        }

        let blockData = await web3.eth.getBlock(block);

        const transactionReceipts = [];
        for (const transactionHash of blockData.transactions) {
            const transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash);
            transactionReceipts.push(transactionReceipt);
        }
        return transactionReceipts
    } catch (error) {
        throw error
    }
}

async function getTransactionTracesForBlockFromQuicknode(blockNumber, quicknodeApiKey) {
    try {
        if (_.isNil(blockNumber) || _.isEmpty(quicknodeApiKey)) {
            errorUtil.throwErr("blockNumber empty");
        }
        let url = `https://tiniest-radial-sky.quiknode.pro/${quicknodeApiKey}`; //globalConst
        let payload = {
            id: 1, jsonrpc: "2.0", method: "debug_traceBlockByNumber", params: [blockNumber, {tracer: "callTracer"}],
        };
        let response = await axios.post(url, payload);
        return response.data.result
    } catch (error) {
        throw error
    }
}

async function getPastLogs(address, topics, fromBlock, toBlock, web3) {
    try {
        if (_.isEmpty(address) || _.isEmpty(topics) || _.isNil(fromBlock) || _.isNil(toBlock) || _.isEmpty(web3)) {
            throw new Error(`Missing Params : address: ${address}, topics: ${topics}, fromBlock: ${fromBlock}, toBlock: ${toBlock}, web3: ${web3}`);
        }

        if (!_.isArray(topics)) {
            errorUtil.throwErr("topics is not an array")
        }

        if (toBlock - fromBlock > libConfig.web3.getPastLogsMaxBLockRangeLimit) {
            errorUtil.throwErr(`max block range limit exceeded. fromBlock: ${fromBlock}, toBlock: ${toBlock}, maxBlockRangeLimit: ${libConfig.web3.getPastLogsMaxBLockRangeLimit}`);
        }

        let logs = await web3.eth.getPastLogs({
            address: address, topics: topics, fromBlock: fromBlock, toBlock: toBlock,
        });

        return logs;
    } catch (error) {
        throw error;
    }
}

//to get the traces of a transaction
async function getTransactionTraces(transactionHash, nodeHttpUrl, tracerType = "callTracer") {
    try {
        if (_.isEmpty(transactionHash) || _.isEmpty(nodeHttpUrl) || _.isEmpty(tracerType)) {
            errorUtil.throwErr("transactionHash/nodeHttpUrl/tracerType empty");
        }
        let traces = await axios.post(nodeHttpUrl, {
            method: "debug_traceTransaction", params: [transactionHash, {tracer: tracerType}], jsonrpc: "2.0", id: "2",
        })

        //check if the response has an error
        if (traces.data.error) {
            errorUtil.throwErr(`${traces.data.error}`)
        }

        return traces.data.result
    } catch (error) {
        throw error
    }
}

function extractLogsFromReceipts(receipts) {
    try {
        if (_.isNil(receipts)) {
            throw new Error("receipts empty");
        }
        let logs = [];
        for (const receipt of receipts) {
            if (!_.isEmpty(receipt.logs)) {
                logs = logs.concat(receipt.logs);
            }
        }
        return logs;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getWebSocketWeb3Instance: getWebSocketWeb3Instance,
    getTransactionReceiptsForBlock: getTransactionReceiptsForBlock,
    getTransactionTracesForBlockFromQuicknode: getTransactionTracesForBlockFromQuicknode,
    getPastLogs: getPastLogs,
    getTransactionTraces: getTransactionTraces,
    extractLogsFromReceipts: extractLogsFromReceipts,
};
