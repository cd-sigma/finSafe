async function safeWrapper(calls, args = []) {
    try {
        let result = await calls(...(args || []))
        return result
    } catch (error) {
        return null
    }
}

module.exports = {
    safeWrapper: safeWrapper,
}