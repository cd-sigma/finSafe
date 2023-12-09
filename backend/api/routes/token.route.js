const express = require("express")
const router = express.Router()
const tokenController = require("../controllers/token.controller")

router.route("/:tokenAddress").get(tokenController.getTokenInfo)

module.exports = router
