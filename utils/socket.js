const mqtt = require("mqtt")
const {postSpeakerData, postRelayData, postLCDData, getLastestData} = require("./AdafruitIO")
const {addNewAlarm} = require("../models/Models")

const errorCb = (err)=>{
    if(err)
        console.error(err);
}

const turnOnAlarm = async(temperature, gas)=>{
    const turnOnSpeaker = postSpeakerData(500)
    const turnOnAlarm = postRelayData(true)
    const alarmMessage = postLCDData("Danger!!")
    const recordAlarm = addNewAlarm("default@gmail.com", {gas, temperature})

    try{
        const results = await Promise.all([turnOnSpeaker, turnOnAlarm, alarmMessage, recordAlarm])
        return results.reduce((acc, cur)=>acc&&cur)
    }
    catch(err){
        console.error(err);
        return false;
    }
}

const subscribeAdafruit = async(socketServer)=>{
    let [temperature, gas, relay ] = await getLastestData();
    socketServer.on("connection", (socket)=>{
        socket.emit("lastest", [temperature, gas, relay]);
        //socket.send("Hello");
        socket.on("disconnect", ()=>{
          console.log("Disconnected!")
        })
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
                if(success)
                    socketServer.emit("alarm", {temperature, gasOverThreshold});
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
                    if(success)
                        socketServer.emit("alarm", {temperature, gasOverThreshold});
                }    
            }
            else
                socketServer.emit("relay", jsonData);
        })
    })
}

module.exports = {subscribeAdafruit}