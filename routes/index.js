var express = require("express");
var router = express.Router();
const authController = require("../controllers/authController");

router.use(authController.isLoggedIn);
/* GET home page. */
router.get("/index", function (req, res, next) {
  res.render("index");
});

router.get("/signup", function (req, res, next) {
  res.render("signup");
});

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.post("/login", authController.login, function (req, res, next) {
  res.redirect("feed");
});

router.get("/contact", function (req, res, next) {
  res.render("contact");
});

router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/feed", authController.protect, function (req, res, next) {
  res.render("feed");
});

module.exports = router;
