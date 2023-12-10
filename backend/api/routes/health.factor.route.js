const express = require("express")
const router = express.Router()
const healthFactorController = require("../controllers/health.factor.controller")

router.route("/:address").get(healthFactorController.defaultHealthFactor)

router.route("/calculate").post(healthFactorController.calculateHealthFactor)

module.exports = router
