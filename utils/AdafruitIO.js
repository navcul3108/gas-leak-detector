const axios = require("axios").default;
require("dotenv").config();

const axiosInstance = axios.create({
    headers: {
        "X-AIO-key": process.env.ADAFRUIT_KEY
    },
    responseType: "json"
})

const axiosInstance1 = axios.create({
    headers: {
        "X-AIO-key": process.env.ADAFRUIT_KEY1
    },
    responseType: "json"
})

// const updateAIOKey = ()=>{
//     axiosInstance.defaults.headers["X-AIO-key"] = process.env.CSE_BBC_KEY;
//     axiosInstance1.defaults.headers["X-AIO-key"] = process.env.CSE_BBC1_KEY;
// }

// const requestKey = async()=>{
//     await axios.get("http://dadn.esp32thanhdanh.link/")
//     .then((response)=>{
//         process.env.CSE_BBC_KEY = response.data.keyBBC;
//         process.env.CSE_BBC1_KEY = response.data.keyBBC1;
//     })
//     .catch((err)=>{
//         console.error(err)
//     })
// }

const parseCSVToJSON = (csvLine)=>{
    const splittedArr = csvLine.split(",");
    // Remove duplicate double quote
    let jsonDataStr = splittedArr.slice(0, splittedArr.length-3).join(",").replace(/""/g, '"');
    if(jsonDataStr.startsWith('"'))
        jsonDataStr = jsonDataStr.substr(1);
    if(jsonDataStr.endsWith('"'))
        jsonDataStr = jsonDataStr.substr(0, jsonDataStr.length-1);

    const dataObj = JSON.parse(jsonDataStr);
    return dataObj
}

const postLedData = async(signal) =>{
    try{
        if(typeof signal=="number" && 0<=signal<=2){
            const formData = {id:"1", name:"LED", data: signal.toString(), unit:""};
              
            const response = await axiosInstance.post(process.env.LED_DATA_FEED_URL, {value: JSON.stringify(formData)});
              
            return response.status === 200;   
        }
        return false
    }
    catch(err){
        return false
    }
}

const postSpeakerData = async(level)=>{
    try{
        if(typeof level=="number" && 0<=level && level<=1023){
            let formData = {id:"3", name:"SPEAKER", data:level.toString(), unit: ""};
            const response = await axiosInstance.post(process.env.SPEAKER_DATA_FEED_URL, {value: JSON.stringify(formData)});
            
            return response.status === 200;   
        }
        return false;
    }
    catch(err){
        return false;
    }
}

const postLCDData = async(message)=>{
    try{
        if(typeof message=="string"){
            let formData = {id:"3", name:"LCD", data:message, unit: ""};
            const response = await axiosInstance.post(process.env.LCD_DATA_FEED_URL, {value: JSON.stringify(formData)});            
            return response.status === 200;   
        }
        return false
    }
    catch(err){
        return false
    }
}

const postTempAndHumidData = async(temp, humid)=>{
    try{
        if(typeof temp=="number" && 0<=temp<=50 && typeof humid=="number" && 0<=humid<=100){
            const formData = {id:"7", name: "TEMP-HUMID", data: `${temp}-${humid}`, unit: "*C-%"}
            const response = await axiosInstance.post(process.env.TEMP_HUMID_DATA_FEED_URL, {value: JSON.stringify(formData)});
            
            return response.status === 200;    
        }
        return false
    }
    catch(err){
        return false
    }
}

const postGasData = async(isOverThreshold)=>{
    if(typeof isOverThreshold=="boolean"){
        try{
            const formData = {id:"23", name:"GAS", data: isOverThreshold?"1":"0", unit: ""};
            const response = await axiosInstance1.post(process.env.GAS_DATA_FEED_URL, {value: JSON.stringify(formData)})
            return response.status === 200;
        }
        catch(err){
            return false
        }
    }
}

const postDRVData = async(speed)=>{
    if(typeof speed=="number" && -255<=speed<=255){
        try{
            const formData = {id:"10", name:"DRV_PWM", data: speed.toString(), unit: ""};
            const response = await axiosInstance.post(process.env.DRV_DATA_FEED_URL, {value: JSON.stringify(formData)})
            return response.status == 200;
        }
        catch(err)
        {
            return false
        }
    }
    return false;
}

const postRelayData = async(turnOn)=>{
    if(typeof turnOn=="boolean"){
        try{
            const formData = {id:"11", name:"RELAY", data: turnOn? "1":"0", unit: ""};
            const response = await axiosInstance1.post(process.env.RELAY_DATA_FEED_URL, {value: JSON.stringify(formData)})
            return response.status == 200;
        }
        catch(err)
        {
            return false
        }
    }
    return false;
}

const getLastestData = async()=>{
    try{
        let response = await axiosInstance.get(process.env.GAS_DATA_FEED_URL+"/retain");
        let lastestGas = parseCSVToJSON(response.data).data; // temp-humid
        response = await axiosInstance1.get(process.env.RELAY_DATA_FEED_URL+"/retain")
        let lastestRelay = parseCSVToJSON(response.data).data;
        response = await axiosInstance1.get(process.env.TEMP_HUMID_DATA_FEED_URL+"/retain")
        let lastestTemp = parseCSVToJSON(response.data).data.split("-")[0]; // temp-humid
        lastestTemp = parseInt(lastestTemp);
        return [lastestTemp, lastestGas, lastestRelay]
    }
    catch(err){
        console.error(err);
        return ["25", "0", "0"]; // return default values
    }
}

module.exports = {postLedData, postSpeakerData, postLCDData, postTempAndHumidData, 
                 postGasData, postDRVData, postRelayData, getLastestData}
