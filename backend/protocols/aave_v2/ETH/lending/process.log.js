const _ = require("lodash");
const groupConfig = require("./config.json");

const erc20Abi = require("../../../../abi/erc20.abi.json");
const dateUtil = require("../../../../util/date.util");
const alertLib = require("../../../../lib/alert.lib");
const errorUtil = require("../../../../util/error.util");
const globalConst = require("../../../../global.const");
const helperUtil = require("../../../../util/helper.util");
const aaveTokensTypeEnum = require("../../../../enum/aave.tokens.type.enum");

const aaveV2Config = require("../../../../config/aave.v2.config.json");
const aTokens = aaveV2Config.tokens.map((token) => token.aTokenAddress);
const stableDebtTokens = aaveV2Config.tokens.map((token) => token.stableDebtTokenAddress);
const variableDebtTokens = aaveV2Config.tokens.map((token) => token.variableDebtTokenAddress);

module.exports = async function processLog(log, web3) {
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
                senderMessage = JSON.stringify({
                    msg: `You have withdrawn ${transferredAmount} ${aaveV2Config.tokens.find((token) => token.aTokenAddress === tokenAddress).symbol}  from your Aave V2 Collateral and transferred to ${receiver}`,
                    blockTimestamp: dateUtil.getCurrentIndianTimeForUnixTimestamp(blockTimestamp),
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                    logIndex: log.logIndex
                });
                receiverTitle = "Aave V2 Collateral Received";
                receiverMessage = JSON.stringify({
                    msg: `You have received ${transferredAmount} ${aaveV2Config.tokens.find((token) => token.aTokenAddress === tokenAddress).symbol} of Aave V2 Collateral from ${sender}`,
                    blockTimestamp: dateUtil.getCurrentIndianTimeForUnixTimestamp(blockTimestamp),
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                    logIndex: log.logIndex
                });
                break;
            case aaveTokensTypeEnum.STABLE_DEBT_TOKEN:
                senderTitle = "Aave V2 Stable Debt Transferred";
                senderMessage = JSON.stringify({
                    msg: `You have transferred ${transferredAmount} ${aaveV2Config.tokens.find((token) => token.stableDebtTokenAddress === tokenAddress).symbol}  of Aave V2 Stable Debt to ${receiver}`,
                    blockTimestamp: dateUtil.getCurrentIndianTimeForUnixTimestamp(blockTimestamp),
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                    logIndex: log.logIndex
                });
                receiverTitle = "Aave V2 Stable Debt Received";
                receiverMessage = JSON.stringify({
                    msg: `You have received ${transferredAmount} ${aaveV2Config.tokens.find((token) => token.stableDebtTokenAddress === tokenAddress).symbol}  of Aave V2 Stable Debt from ${sender}`,
                    blockTimestamp: dateUtil.getCurrentIndianTimeForUnixTimestamp(blockTimestamp),
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                    logIndex: log.logIndex
                });

                break;
            case aaveTokensTypeEnum.VARIABLE_DEBT_TOKEN:
                senderTitle = "Aave V2 Variable Debt Transferred";
                senderMessage = JSON.stringify({
                    msg: `You have transferred ${transferredAmount} ${aaveV2Config.tokens.find((token) => token.variableDebtTokenAddress === tokenAddress).symbol}  of Aave V2 Variable Debt to ${receiver}`,
                    blockTimestamp: dateUtil.getCurrentIndianTimeForUnixTimestamp(blockTimestamp),
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                    logIndex: log.logIndex
                });
                receiverTitle = "Aave V2 Variable Debt Received";
                receiverMessage = JSON.stringify({
                    msg: `You have received ${transferredAmount} ${aaveV2Config.tokens.find((token) => token.variableDebtTokenAddress === tokenAddress).symbol}  of Aave V2 Variable Debt from ${sender}`,
                    blockTimestamp: dateUtil.getCurrentIndianTimeForUnixTimestamp(blockTimestamp),
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                    logIndex: log.logIndex
                });
                break;
            default:
                errorUtil.throwErr("Invalid token type detected");
        }
        await Promise.all([
            alertLib.generateAlert(sender, senderTitle, senderMessage),
            alertLib.generateAlert(receiver, receiverTitle, receiverMessage)
        ]);

        let senderBalance = await tokenContract.methods.balanceOf(sender).call();
        let receiverBalance = await tokenContract.methods.balanceOf(receiver).call();
        senderBalance = senderBalance / (10 ** tokenDecimals);
        receiverBalance = receiverBalance / (10 ** tokenDecimals);

        let dbWriteCalls = [];

        //--------------------------sender supplied non-zero balance update ----------------------------------
        sender !== globalConst.NULL_ADDRESS && tokenType === aaveTokensTypeEnum.A_TOKEN && senderBalance !== 0 && dbWriteCalls.push({
            updateOne: {
                filter: {
                    positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${sender}`
                }, update: {
                    "$pull": {
                        "metadata.supplied": {
                            token: tokenAddress
                        }
                    }
                }
            }
        }, {
            updateOne: {
                filter: {
                    positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${sender}`,
                }, update: {
                    "$set": {
                        positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${sender}`,
                        protocolId: groupConfig.protocolId,
                        chain: groupConfig.chain,
                        group: groupConfig.group,
                        owner: sender,
                    }, "$addToSet": {
                        "metadata.supplied": {
                            token: tokenAddress,
                            balance: senderBalance,
                            underlying: aaveV2Config.tokens.find((token) => token.aTokenAddress === tokenAddress).address,
                            symbol: aaveV2Config.tokens.find((token) => token.aTokenAddress === tokenAddress).symbol,
                        }
                    }
                }, upsert: true
            }
        });

        //---------------------------sender supplied zero balance update-----------------------------
        sender !== globalConst.NULL_ADDRESS && tokenType === aaveTokensTypeEnum.A_TOKEN && senderBalance === 0 && dbWriteCalls.push({
            updateOne: {
                filter: {
                    positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${sender}`
                }, update: {
                    "$pull": {
                        "metadata.supplied": {
                            token: tokenAddress
                        }
                    }
                }
            }
        })

        //--------------------------sender borrowed non-zero balance update ------------------------------
        sender !== globalConst.NULL_ADDRESS && (tokenType === aaveTokensTypeEnum.VARIABLE_DEBT_TOKEN || tokenType === aaveTokensTypeEnum.STABLE_DEBT_TOKEN) && senderBalance !== 0 && dbWriteCalls.push({
            updateOne: {
                filter: {
                    positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${sender}`
                }, update: {
                    "$pull": {
                        "metadata.borrowed": {
                            token: tokenAddress
                        }
                    }
                }
            }
        }, {
            updateOne: {
                filter: {
                    positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${sender}`
                }, update: {
                    $set: {
                        positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${sender}`,
                        protocolId: groupConfig.protocolId,
                        chain: groupConfig.chain,
                        group: groupConfig.group,
                        owner: sender,
                    }, "$addToSet": {
                        "metadata.borrowed": {
                            token: tokenAddress,
                            balance: senderBalance,
                            underlying: tokenType === aaveTokensTypeEnum.STABLE_DEBT_TOKEN ? aaveV2Config.tokens.find((token) => token.stableDebtTokenAddress === tokenAddress).address : aaveV2Config.tokens.find((token) => token.variableDebtTokenAddress === tokenAddress).address,
                            symbol: tokenType === aaveTokensTypeEnum.STABLE_DEBT_TOKEN ? aaveV2Config.tokens.find((token) => token.stableDebtTokenAddress === tokenAddress).symbol : aaveV2Config.tokens.find((token) => token.variableDebtTokenAddress === tokenAddress).symbol,
                        }
                    }
                }, upsert: true
            }
        })

        //---------------------------sender borrowed zero balance update ------------------------
        sender !== globalConst.NULL_ADDRESS && (tokenType === aaveTokensTypeEnum.VARIABLE_DEBT_TOKEN || tokenType === aaveTokensTypeEnum.STABLE_DEBT_TOKEN) && senderBalance === 0 && dbWriteCalls.push({
            updateOne: {
                filter: {
                    positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${sender}`
                }, update: {
                    "$pull": {
                        "metadata.borrowed": {
                            token: tokenAddress
                        }
                    }
                }
            }
        })

        //-----------------------receiver supplied non-zero balance update ----------------------------
        receiver !== globalConst.NULL_ADDRESS && tokenType === aaveTokensTypeEnum.A_TOKEN && receiverBalance !== 0 && dbWriteCalls.push({
            updateOne: {
                filter: {
                    positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${receiver}`
                }, update: {
                    "$pull": {
                        "metadata.supplied": {
                            token: tokenAddress
                        }
                    }
                }
            }
        }, {
            updateOne: {
                filter: {
                    positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${receiver}`,
                }, update: {
                    $set: {
                        positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${receiver}`,
                        protocolId: groupConfig.protocolId,
                        chain: groupConfig.chain,
                        group: groupConfig.group,
                        owner: receiver,
                    }, "$addToSet": {
                        "metadata.supplied": {
                            token: tokenAddress,
                            balance: receiverBalance,
                            underlying: aaveV2Config.tokens.find((token) => token.aTokenAddress === tokenAddress).address,
                            symbol: aaveV2Config.tokens.find((token) => token.aTokenAddress === tokenAddress).symbol,
                        }
                    }
                }, upsert: true
            }
        })

        //----------------------- receiver supplied zero balance update ----------------------------------
        receiver !== globalConst.NULL_ADDRESS && tokenType === aaveTokensTypeEnum.A_TOKEN && receiverBalance === 0 && dbWriteCalls.push({
            updateOne: {
                filter: {
                    positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${receiver}`
                }, update: {
                    "$pull": {
                        "metadata.supplied": {
                            token: tokenAddress
                        }
                    }
                }
            }
        })

        //---------------------- receiver borrowed non-zero balance update-----------------------------------
        receiver !== globalConst.NULL_ADDRESS && (tokenType === aaveTokensTypeEnum.VARIABLE_DEBT_TOKEN || tokenType === aaveTokensTypeEnum.STABLE_DEBT_TOKEN) && receiverBalance !== 0 && dbWriteCalls.push({
            updateOne: {
                filter: {
                    positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${receiver}`
                }, update: {
                    "$pull": {
                        "metadata.borrowed": {
                            token: tokenAddress
                        }
                    }
                }
            }
        }, {
            updateOne: {
                filter: {
                    positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${receiver}`
                }, update: {
                    $set: {
                        positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${receiver}`,
                        protocolId: groupConfig.protocolId,
                        chain: groupConfig.chain,
                        group: groupConfig.group,
                        owner: receiver
                    }, "$addToSet": {
                        "metadata.borrowed": {
                            token: tokenAddress,
                            balance: receiverBalance,
                            underlying: tokenType === aaveTokensTypeEnum.STABLE_DEBT_TOKEN ? aaveV2Config.tokens.find((token) => token.stableDebtTokenAddress === tokenAddress).address : aaveV2Config.tokens.find((token) => token.variableDebtTokenAddress === tokenAddress).address,
                            symbol: tokenType === aaveTokensTypeEnum.STABLE_DEBT_TOKEN ? aaveV2Config.tokens.find((token) => token.stableDebtTokenAddress === tokenAddress).symbol : aaveV2Config.tokens.find((token) => token.variableDebtTokenAddress === tokenAddress).symbol,
                        }
                    }
                }, upsert: true
            }
        })

        //--------------------receiver borrowed zero balance update --------------------------------------
        receiver !== globalConst.NULL_ADDRESS && (tokenType === aaveTokensTypeEnum.VARIABLE_DEBT_TOKEN || tokenType === aaveTokensTypeEnum.STABLE_DEBT_TOKEN) && receiverBalance === 0 && dbWriteCalls.push({
            updateOne: {
                filter: {
                    positionId: `${groupConfig.protocolId}-${groupConfig.chain}-${groupConfig.group}-${receiver}`
                }, update: {
                    "$pull": {
                        "metadata.borrowed": {
                            token: tokenAddress
                        }
                    }
                }
            }
        })

        return dbWriteCalls
    } catch (error) {
        throw error;
    }
};
