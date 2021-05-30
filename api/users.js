const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { respondSuccess } = require("../utils/apiUtils");

// API for mobile app

router.post("/signup", authController.createNewUser);

router.post("/login", authController.authenticateLoginInfo);
router.post("/logout", authController.setJwtTokenExpire, function (req, res) {
  respondSuccess(res, 200, "Logged out!")
});


module.exports = router;
