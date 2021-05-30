const { Router} = require("express")
const {protect} = require("../controllers/authController")
const {postSpeakerData, postDRVData, postRelayData, postLCDData} = require("../utils/AdafruitIO")
const router = Router();
const {respondSuccess} = require("../utils/apiUtils")
const AppError = require("../utils/appError")

router.use(protect)

router.post("/turn-on", (_, res, next)=>{
    const turnOnSpeaker = postSpeakerData(500)
    const openValve = postRelayData(true)
    const alarmMessage = postLCDData("Danger!!")
    const openVentilation = postDRVData(255)

    Promise.all([turnOnSpeaker, openValve, alarmMessage, openVentilation])
        .then((results)=>{
            if(results.reduce((acc, cur)=>acc&&cur))
                respondSuccess(res, 200, "Alarm has been turned on")
            else
                next(new AppError("There is an error while processing request!", 500))
        })
        .catch((err)=>{
            next(new AppError("There is an error while processing request!", 500))
        })
})

router.post("/turn-off", (req, res)=>{
    const turnOffSpeaker = postSpeakerData(0)
    const closeValve = postRelayData(false)
    const alarmMessage = postLCDData("Turned off")
    const closeVentilation = postDRVData(0)

    Promise.all([turnOffSpeaker, closeValve, alarmMessage, closeVentilation])
        .then((results)=>{
            if(results.reduce((acc, cur)=>acc&&cur))
                respondSuccess(res, 200, "Alarm has been turned off")
            else
                next(new AppError("There is an error while processing request!", 500))
        })
        .catch((err)=>{
            next(new AppError("There is an error while processing request!", 500))
        })
})


module.exports = router