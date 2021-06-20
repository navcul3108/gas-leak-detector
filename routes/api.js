var express = require("express");
var router = express.Router();
var alarmAPIRouter = require("../api/alarmApi")
var userAPIRouter = require("../api/users")
var adminAPIRouter = require("../api/adminApi")
var temperatureAPIRouter = require("../api/temperatureApi")

router.use("/alarm", alarmAPIRouter)
router.use("/users", userAPIRouter)
router.use("/admin", adminAPIRouter)
router.use("/temperature", temperatureAPIRouter)

router.get("*", (req, res)=>{
    res.status(404).json("Đường dẫn không tồn tại!")
})

router.post("*", (req, res)=>{
    res.status(404).json("Đường dẫn không tồn tại!")
})

module.exports = router