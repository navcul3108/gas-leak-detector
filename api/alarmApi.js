const { Router} = require("express")
const authController = require("../controllers/authController")
const {postSpeakerData, postDRVData, postRelayData, postLCDData} = require("../adafruit/api")

const alarmAPIRouter = Router();

alarmAPIRouter.use(authController.protect)

alarmAPIRouter.post("/turn-on", (req, res)=>{
    const turnOnSpeaker = ()=>postSpeakerData(500)
    const openValve = ()=>postRelayData(true)
    const alarmMessage = ()=>postLCDData("Nguy hiểm!!!")
    const openVentilation = ()=>postDRVData(255)

    Promise.all([turnOnSpeaker, openValve, alarmMessage, openVentilation])
        .then((results)=>{
            if(results.reduce((acc, cur)=>acc&&cur))
                res.status(200).json("Cảnh báo đã được bật")
            else
                res.status(500).json("Có lỗi xảy ra!")
        })
        .catch((err)=>{
            res.status(500).json("Có lỗi xảy ra!")
        })
})

alarmAPIRouter.post("/turn-on", (req, res)=>{
    const turnOffSpeaker = ()=>postSpeakerData(0)
    const closeValve = ()=>postRelayData(false)
    const alarmMessage = ()=>postLCDData("")
    const closeVentilation = ()=>postDRVData(0)

    Promise.all([turnOffSpeaker, closeValve, alarmMessage, closeVentilation])
        .then((results)=>{
            if(results.reduce((acc, cur)=>acc&&cur))
                res.status(200).json("Cảnh báo đã được tắt")
            else
                res.status(500).json("Có lỗi xảy ra!")
        })
        .catch((err)=>{
            res.status(500).json("Có lỗi xảy ra!")
        })
})