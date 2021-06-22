const { Router} = require("express")
const {protect} = require("../controllers/authController")
const {postSpeakerData, postRelayData, postLCDData} = require("../utils/AdafruitIO")
const router = Router();
const {respondSuccess} = require("../utils/apiUtils")
const AppError = require("../utils/appError")
const {addNewAlarm, Alarm} = require("../models/Models") 

router.use(protect)

router.post("/turn-on", (req, res, next)=>{
    const userEmail = res.locals.user.email;
    const {gas, temperature} = req.body

    if(!gas || !temperature)
        return next(new AppError("You must provide enough information", 400))

    const turnOnSpeaker = postSpeakerData(500)
    const turnOnAlarm = postRelayData(true)
    const alarmMessage = postLCDData("Danger!!")
    const recordAlarm = addNewAlarm(userEmail, {gas, temperature})

    Promise.all([turnOnSpeaker, turnOnAlarm, alarmMessage, recordAlarm])
        .then((results)=>{
            console.log('results :>> ', results);
            if(results.reduce((acc, cur)=>acc&&cur))
                respondSuccess(res, 200, "Alarm has been turned on")
            else
                next(new AppError("There is an error while processing request!", 500))
        })
        .catch((err)=>{
            next(new AppError("There is an error while processing request!", 500))
        })
})

router.post("/turn-off", (req, res, next)=>{
    const turnOffSpeaker = postSpeakerData(0)
    const turnOffAlarm = postRelayData(false)
    const alarmMessage = postLCDData("Turned off")

    Promise.all([turnOffSpeaker, turnOffAlarm, alarmMessage])
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

router.get("/history", async(req, res, next)=>{
    const userEmail = res.locals.user.email;
    const data = (await Alarm.where("userEmail", "==", userEmail).get()).docs
        .map((doc)=> {
            const data = doc.data()
            return {
                userEmail: data.userEmail,
                gas: data.gas,
                temperature: data.temperature,
                timestamp: data.timestamp.toDate().toISOString()
            }   
        })
    res.status(200).json(data)
})
module.exports = router