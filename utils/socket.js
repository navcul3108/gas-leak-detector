const mqtt = require("mqtt")
const {postSpeakerData, postRelayData, postLCDData, getLastestData} = require("./AdafruitIO")
const {addNewAlarm} = require("../models/Models")

const errorCb = (err)=>{
    if(err)
        console.error(err);
}

const turnOnAlarm = async(temperature, gas, userEmail="default@gmail.com")=>{
    const turnOnSpeaker = postSpeakerData(500)
    const turnOnAlarm = postRelayData(true)
    const alarmMessage = postLCDData("Danger!!")
    const recordAlarm = addNewAlarm(userEmail, {gas, temperature})

    try{
        const results = await Promise.all([turnOnSpeaker, turnOnAlarm, alarmMessage, recordAlarm])
        return results.reduce((acc, cur)=>acc&&cur)
    }
    catch(err){
        console.error(err);
        return false;
    }
}

const turnOffAlarm = ()=>{
    const turnOffSpeaker = postSpeakerData(0)
    const turnOffAlarm = postRelayData(false)
    const showMessage = postLCDData("Turned off")
    setTimeout(()=>{
        if(global.alarm){
            Promise.all([turnOffSpeaker, turnOffAlarm, showMessage])
                .then((results)=>{
                    if(results.reduce((acc, cur)=>acc&&cur)){
                        global.alarm = false
                    }                                
                })
                .catch((err)=>{
                    console.error(err);
                })
        }
    }, 300000)
}

const subscribeAdafruit = async(socketServer)=>{
    let [temperatureData, gas, relay ] = await getLastestData();
    let temperature = temperatureData[temperatureData.length-1].temperature;
    global.alarm = relay === "1"
    socketServer.on("connection", (socket)=>{
        //console.log("Connected");
        socketServer.emit("lastest", {temperatureData, gas, relay});
    })

    const url1 = `mqtts://${process.env.ADA_USERNAME}:${process.env.ADAFRUIT_KEY}@io.adafruit.com`;
    const url2 = `mqtts://${process.env.ADA_USERNAME1}:${process.env.ADAFRUIT_KEY1}@io.adafruit.com`;
    const client1 = mqtt.connect(url1);
    const client2 = mqtt.connect(url2);
    client1.on("connect", ()=>{
        client1.subscribe(process.env.TEMP_HUMID_FEED_MQTT, errorCb);

        client1.on("message", async(topic, payload)=>{
            const jsonData = JSON.parse(payload.toString())
            socketServer.emit("tempHumid", jsonData);
            temperature = parseInt(jsonData.data.split("-")[0]);
            if(temperature>40){
                const success = await turnOnAlarm(temperature, gasOverThreshold);
                if(success){
                    global.alarm = true;
                    socketServer.emit("alarm", {temperature, gasOverThreshold});
                    turnOffAlarm()
                }
            }
            
        })
    })

    client2.on("connect", ()=>{
        // Todo: RELAY
        client2.subscribe(process.env.GAS_FEED_MQTT);
        client2.subscribe(process.env.RELAY_FEED_MQTT);

        client2.on("message", async(topic, payload)=>{
            const jsonData = JSON.parse(payload.toString());
            if(topic===process.env.GAS_FEED_MQTT){
                socketServer.emit("gas", jsonData);
                gasOverThreshold = jsonData.data === "1"
                if(gasOverThreshold){
                    const success = await turnOnAlarm(temperature, gasOverThreshold)
                    if(success){
                        socketServer.emit("alarm", {temperature, gasOverThreshold});
                        global.alarm = true
                        turnOffAlarm()
                    }
                }    
            }
            else
                socketServer.emit("relay", jsonData);
        })
    })
}

module.exports = {subscribeAdafruit}