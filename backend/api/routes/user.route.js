const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")

router.route("/:userAddress").get(userController.getUserPositions)

module.exports = router
