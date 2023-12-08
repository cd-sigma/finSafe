async function sleep(duration) {
    try {
        if (duration == null) {
            throw new Error(`Please specify the sleep duration!`)
        }

        await new Promise((resolve) => setTimeout(resolve, duration))

    } catch (error) {
        throw error
    }
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
        .map((key) => `${key}:${typeof json[key] === "object" ? "\n\t" + spreadJson(json[key]).replace(/\n/g, "\n\t") : json[key]}`)
        .join("\n")
}

module.exports = {
    sleep: sleep, removeLeadingZeroes: removeLeadingZeroes, bytesToUtf8: bytesToUtf8, spreadJson: spreadJson
}