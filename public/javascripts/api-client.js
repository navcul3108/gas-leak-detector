const parseCSVToJSON = (csvLine)=>{
    const splittedArr = csvLine.split(",");
    // Remove duplicate double quote
    let jsonDataStr = splittedArr.slice(0, splittedArr.length-3).join(",").replace(/""/g, '"');
    if(jsonDataStr.startsWith(","))
        jsonDataStr = jsonDataStr.substr(1);
    if(jsonDataStr.endsWith(","))
        jsonDataStr = jsonDataStr.substr(0, jsonDataStr.length-2);

    const dataObj = JSON.parse(jsonDataStr);
    return dataObj
}

const postLedData = async(axiosInstance, feedURL, signal) =>{
    try{
        if(typeof signal=="number" && 0<=signal<=2){
            const formData = {id:"1", name:"LED", data: signal.toString(), unit:""};
              
            const response = await axiosInstance.post(feedURL, {value: JSON.stringify(formData)});
            return response.status === 200;   
        }
        return false
    }
    catch(err){
        console.error(err);
        return false
    }
}

const postSpeakerData = async(axiosInstance, feedURL, level)=>{
    try{
        if(typeof level=="number" && 0<=level && level<=1023){
            let formData = {id:"3", name:"SPEAKER", data:level.toString(), unit: ""};
            const response = await axiosInstance.post(feedURL, {value: JSON.stringify(formData)});
            return response.status === 200;   
        }
        return false;
    }
    catch(err){
        console.error(err)
        return false;
    }
}

const postLCDData = async(axiosInstance, feedURL, message)=>{
    try{
        if(typeof message=="string"){
            let formData = {id:"5", name:"LCD", data:message, unit: ""};
            const response = await axiosInstance.post(feedURL, {value: JSON.stringify(formData)});
            return response.status === 200;   
        }
        return false
    }
    catch(err){
        console.error(err);
        return false
    }
}

const postTempAndHumidData = async(axiosInstance, feedURL, temp, humid)=>{
    try{
        if(typeof temp=="number" && 0<=temp<=50 && typeof humid=="number" && 0<=humid<=100){
            const formData = {id:"7", name: "TEMP-HUMID", data: `${temp}-${humid}`, unit: "*C-%"}
            const response = await axiosInstance.post(feedURL, {value: JSON.stringify(formData)});
            return response.status === 200;    
        }
        return false
    }
    catch(err){
        console.error(err);
        return false
    }
}

const postGasData = async(axiosInstance, feedURL, isOverThreshold)=>{
    if(typeof isOverThreshold=="boolean"){
        try{
            const formData = {id:"23", name:"GAS", data: isOverThreshold?"1":"0", unit: ""};
            const response = await axiosInstance.post(feedURL, {value: JSON.stringify(formData)})
            return response.status === 200;
        }
        catch(err){
            console.error(err);
        }
    }
}

const getLastestData = async(axiosInstance, feedURL)=>{
    try{
        const response = await axiosInstance.get(feedURL+"/retain");
        const csvLine = response.data.toString();
        const data = parseCSVToJSON(csvLine);
        return data;
    }
    catch(err){
        return null
    }
}

const postDRVData = async(axiosInstance, feedURL, speed)=>{
    if(typeof speed=="number" && -255<=speed<=255){
        try{
            const formData = {id:"10", name:"DRV_PWM", data: speed.toString(), unit: ""};
            const response = await axiosInstance.post(feedURL, {value: JSON.stringify(formData)})
            return response.status == 200;
        }
        catch(err)
        {
            console.error(err);
            return false
        }
    }
    return false;
}

const postRelayData = async(axiosInstance, feedURL, turnOn)=>{
    if(typeof turnOn=="boolean"){
        try{
            const formData = {id:"11", name:"RELAY", data: turnOn? "1":"0", unit: ""};
            const response = await axiosInstance.post(feedURL, {value: JSON.stringify(formData)})
            return response.status == 200;
        }
        catch(err)
        {
            console.error(err);
            return false
        }
        
    }
    return false;
}

export {postLedData, postGasData, postLCDData, postSpeakerData, postTempAndHumidData, postDRVData, getLastestData, postRelayData}