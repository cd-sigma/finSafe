const express = require("express")
const router = express.Router()
const healthFactorController = require("../controllers/health.factor.controller")

router.route("/:address").get(healthFactorController.calculateHealthFactor)

module.exports = router
