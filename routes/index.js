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

router.post("/signup", authController.signup);

router.get("/login", function (req, res, next) {
  res.render("login");
});

router.post("/login", authController.login);
router.post("/logout", authController.logout, (req, res, next) => {
  res.redirect("index");
});

router.get("/contact", function (req, res, next) {
  res.render("contact");
});

router.get(
  "/feed",
  authController.protect,
  authController.isLoggedIn,
  function (req, res, next) {
    res.render("feed");
  }
);

router.get("/", function (req, res, next) {
  res.render("index");
});

module.exports = router;
