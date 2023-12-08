const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")

router.route("/:address").get(userController.getUserPositions)

router.route("/nonce/:address").get(userController.getNonce)

router.route("/validate/signature").post(userController.validateSignature)

module.exports = router
