const _ = require("lodash");
const groupConfig = require("./config.json");

const erc20Abi = require("../../../../abi/erc20.abi.json");
const globalConst = require("../../../../global.const");
const helperUtil = require("../../../../util/helper.util");
const aaveTokensTypeEnum = require("../../../../enum/aave.tokens.type.enum");

const aaveV2Config = require("../../../../config/aave.v2.config.json");
const aTokens = aaveV2Config.tokens.map((token) => token.aTokenAddress);
const stableDebtTokens = aaveV2Config.tokens.map((token) => token.stableDebtTokenAddress);
const variableDebtTokens = aaveV2Config.tokens.map((token) => token.variableDebtTokenAddress);


module.exports = async function processLog(log, web3) {
    return new Promise(async (resolve, reject) => {
            try {
                let sender = helperUtil.removeLeadingZeroes(log.topics[1]).toLowerCase();
                let receiver = helperUtil.removeLeadingZeroes(log.topics[2]).toLowerCase();

                let tokenAddress = log.address.toLowerCase()
                let tokenType = aTokens.includes(tokenAddress) ? aaveTokensTypeEnum.A_TOKEN : stableDebtTokens.includes(tokenAddress) ? aaveTokensTypeEnum.STABLE_DEBT_TOKEN : variableDebtTokens.includes(tokenAddress) ? aaveTokensTypeEnum.VARIABLE_DEBT_TOKEN : "unknown";
                let tokenContract = new web3.eth.Contract(erc20Abi, tokenAddress);
                let tokenDecimals = await tokenContract.methods.decimals().call();

                let senderBalance = await tokenContract.methods.balanceOf(sender).call();
                let receiverBalance = await tokenContract.methods.balanceOf(receiver).call();
                senderBalance = senderBalance / (10 ** tokenDecimals);
                receiverBalance = receiverBalance / (10 ** tokenDecimals);

                let dbWriteCalls = [];

                //--------------------------sender supplied non-zero balance update ----------------------------------
                sender !== globalConst.NULL_ADDRESS && tokenType === aaveTokensTypeEnum.A_TOKEN && senderBalance !== 0 && dbWriteCalls.push(
                    {
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
                    },
                    {
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
                                },
                                "$addToSet": {
                                    "metadata.supplied": {
                                        token: tokenAddress,
                                        balance: senderBalance,
                                        underlying: aaveV2Config.tokens.find((token) => token.aTokenAddress === tokenAddress).address,
                                        symbol: aaveV2Config.tokens.find((token) => token.aTokenAddress === tokenAddress).symbol,
                                    }
                                }
                            }, upsert: true
                        }
                    }
                )
                ;

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
                sender !== globalConst.NULL_ADDRESS && (tokenType === aaveTokensTypeEnum.VARIABLE_DEBT_TOKEN || tokenType === aaveTokensTypeEnum.STABLE_DEBT_TOKEN) && senderBalance !== 0 && dbWriteCalls.push(
                    {
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
                                },
                                "$addToSet": {
                                    "metadata.borrowed": {
                                        token: tokenAddress,
                                        balance: senderBalance,
                                        underlying: tokenType === aaveTokensTypeEnum.STABLE_DEBT_TOKEN ? aaveV2Config.tokens.find((token) => token.stableDebtTokenAddress === tokenAddress).address :
                                            aaveV2Config.tokens.find((token) => token.variableDebtTokenAddress === tokenAddress).address,
                                        symbol: tokenType === aaveTokensTypeEnum.STABLE_DEBT_TOKEN ? aaveV2Config.tokens.find((token) => token.stableDebtTokenAddress === tokenAddress).symbol :
                                            aaveV2Config.tokens.find((token) => token.variableDebtTokenAddress === tokenAddress).symbol,
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
                receiver !== globalConst.NULL_ADDRESS && tokenType === aaveTokensTypeEnum.A_TOKEN && receiverBalance !== 0 && dbWriteCalls.push(
                    {
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
                                },
                                "$addToSet": {
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
                receiver !== globalConst.NULL_ADDRESS && (tokenType === aaveTokensTypeEnum.VARIABLE_DEBT_TOKEN || tokenType === aaveTokensTypeEnum.STABLE_DEBT_TOKEN) && receiverBalance !== 0 && dbWriteCalls.push(
                    {
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
                                },
                                "$addToSet": {
                                    "metadata.borrowed": {
                                        token: tokenAddress,
                                        balance: receiverBalance,
                                        underlying: tokenType === aaveTokensTypeEnum.STABLE_DEBT_TOKEN ? aaveV2Config.tokens.find((token) => token.stableDebtTokenAddress === tokenAddress).address :
                                            aaveV2Config.tokens.find((token) => token.variableDebtTokenAddress === tokenAddress).address,
                                        symbol: tokenType === aaveTokensTypeEnum.STABLE_DEBT_TOKEN ? aaveV2Config.tokens.find((token) => token.stableDebtTokenAddress === tokenAddress).symbol :
                                            aaveV2Config.tokens.find((token) => token.variableDebtTokenAddress === tokenAddress).symbol,
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

                resolve(dbWriteCalls);
            } catch
                (error) {
                reject(error);
            }
        }
    )
        ;
}
;
