const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

/* GET users listing. */

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get("/", authController.protect, userController.getAllUsers);

module.exports = router;
