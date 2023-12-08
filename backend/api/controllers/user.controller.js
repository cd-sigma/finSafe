async function getUserPositions(req, res) {
    try {
        const {userAddress} = req.params
        const user = await userService.getUserPositions(userAddress)
        return responseLib.sendResponse(res, user, null, 200)
    } catch (error) {
        return responseLib.sendResponse(res, null, error, 500)
    }
}