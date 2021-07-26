const { Router} = require("express")
const {protect, isLoggedIn} = require("../controllers/authController")
const {postSpeakerData, postRelayData, postLCDData} = require("../utils/AdafruitIO")
const router = Router();
const {respondSuccess} = require("../utils/apiUtils")
const AppError = require("../utils/appError")
const {addNewAlarm, Alarm} = require("../models/Models") 

router.use(protect)
router.use(isLoggedIn)
router.post("/turn-on", (req, res, next)=>{
    const userEmail = res.locals.user.email;
    const {gas, temperature} = req.body

    if(!gas || !temperature)
        return next(new AppError("You must provide enough information", 400))

    if(global.alarm)
        return next(new AppError("Alarm has already been turned on", 400))

    // const turnOnSpeaker = postSpeakerData.bind({}, 500)
    // const turnOnAlarm =  postRelayData.bind({}, true)
    // const showDangerMessage =  postLCDData.bind({}, "Danger!!")
    // const turnOffSpeaker =  postSpeakerData.bind({}, 0)
    // const turnOffAlarm = postRelayData.bind({}, false)
    // const showMessage = postLCDData.bind({}, "Turned off")
    // const recordAlarm = addNewAlarm.bind({}, userEmail, {gas, temperature})

    Promise.all([postSpeakerData(500), postRelayData(true), postLCDData("Danger!"), addNewAlarm(userEmail, {gas, temperature})])
        .then((results)=>{
            console.log('results :>> ', results);
            if(results.reduce((acc, cur)=>acc&&cur)){
                global.alarm = true;
                respondSuccess(res, 200, "Alarm has been turned on")
                // Turn off alarm after 5 minutes
                setTimeout(()=>{
                    if(global.alarm){
                        Promise.all([postSpeakerData(0), postRelayData(false), postLCDData("Turned off!")])
                            .then((offResults)=>{
                                console.log('offResults :>> ', offResults);
                                if(offResults.reduce((acc, cur)=>acc&&cur)){
                                    global.alarm = false
                                }                                
                            })
                            .catch((err)=>{
                                console.error(err);
                            })
                    }
                }, 300000)
            }
            else
                next(new AppError("There is an error while processing request!", 500))
        })
        .catch((err)=>{
            next(new AppError("There is an error while processing request!", 500))
        })
})

router.post("/turn-off", (req, res, next)=>{
    // const turnOffSpeaker = postSpeakerData.bind({}, 0)
    // const turnOffAlarm = postRelayData.bind({}, false)
    // const showMessage = postLCDData.bind({}, "Turned off")

    if(!global.alarm)
        return next(new AppError("Alarm has already been turned off", 400))

    Promise.all([postSpeakerData(0), postRelayData(false), postLCDData("Turned off!")])
        .then((results)=>{
            if(results.reduce((acc, cur)=>acc&&cur)){
                respondSuccess(res, 200, "Alarm has been turned off")
                global.alarm = false
            }
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

router.get("/state", (req, res, next)=>{
    res.status(200).json({
        state: global.alarm? "on": "off"
    })
})
module.exports = router