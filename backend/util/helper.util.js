/*
    @author: ciphernova
    @date: 2023/07/11
    @description: This file contains helper functions that are used throughout the project.
 */

async function sleep(duration) {
    return new Promise(async (resolve, reject) => {
        try {
            if (duration == null) {
                throw new Error(`Please specify the sleep duration!`)
            }

            await new Promise((resolve) => setTimeout(resolve, duration))

            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

function removeLeadingZeroes(hex) {
    hex = hex.substring(2)
    hex = hex.substring(24)
    hex = "0x" + hex
    return hex
}

function bytesToUtf8(bytes, web3) {
    return web3.utils.hexToUtf8(bytes)
}

//recursively spread json into string
function spreadJson(json) {
    return Object.keys(json)
        .map((key) => `${key}:${typeof json[key] === "object" ? "\n\t" + spreadJson(json[key]).replace(/\n/g, "\n\t")
            : json[key]}`)
        .join("\n")
}

module.exports = {
    sleep: sleep,
    removeLeadingZeroes: removeLeadingZeroes,
    bytesToUtf8: bytesToUtf8,
    spreadJson: spreadJson
}