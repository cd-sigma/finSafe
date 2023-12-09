const express = require("express")
const router = express.Router()

const cmtController = require("../controllers/cmt.controller")
const authMiddleware = require("../../middleware/jwt.auth.middleware")

router.post("/order/create", authMiddleware.isLoggedIn, cmtController.addCmtOrder);

module.exports = router
