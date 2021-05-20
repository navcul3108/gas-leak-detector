import  {postLedData, postGasData, postLCDData, postSpeakerData, postTempAndHumidData, postDRVData, getLastestData, postRelayData} from "./api-client.js";

var axiosInstance = null;
var userName = null, feedsURL = null, AIOkey = null;
var gasFeedUrl = null, ledFeedUrl = null, lcdFeedUrl = null, speakerFeedUrl = null, tempHumidFeedUrl = null, drvFeedUrl = null, relayFeedUrl = null;
var mqttClient = null;

function errCb(err){
    if(err)
        console.error(err);
}

$("#confirm-info").click(function(){
    if($("#adafruit-user-name").val()=="")
        alert("You must specify user name")
    else if($("#aio-key").val()=="")
        alert("You must specify key of Feeds")
    else{
        userName = $("#adafruit-user-name").val();
        feedsURL = `https://io.adafruit.com/api/v2/${userName}/feeds`
        AIOkey = $("#aio-key").val();
        const url = `ws://${userName}:${AIOkey}@io.adafruit.com`;
        mqttClient = mqtt.connect(url);
        
        const ledFeed = `${userName}/feeds/${$("#led-feed-name").val()}`;
        const lcdFeed = `${userName}/feeds/${$("#lcd-feed-name").val()}`;
        const speakerFeed = `${userName}/feeds/${$("#speaker-feed-name").val()}`;
        const tempHumidFeed = `${userName}/feeds/${$("#temp-humid-feed-name").val()}`;
        const gasFeed = `${userName}/feeds/${$("#gas-feed-name").val()}`;
        const drvFeed = `${userName}/feeds/${$("#drv-feed-name").val()}`;
        const relayFeed = `${userName}/feeds/${$("#relay-feed-name").val()}`;

        mqttClient.subscribe(ledFeed, errCb);
        mqttClient.subscribe(lcdFeed, errCb);
        mqttClient.subscribe(speakerFeed, errCb);
        mqttClient.subscribe(tempHumidFeed, errCb);
        mqttClient.subscribe(gasFeed, errCb);
        mqttClient.subscribe(drvFeed, errCb);
        mqttClient.subscribe(relayFeed, errCb);

        mqttClient.on("message", function (topic, payload) {
            console.log('topic :>> ', topic);
            const data = JSON.parse(payload.toString());
            console.log('data :>> ', data);
            switch(topic){
                case ledFeed:
                    $("#led-area .id-value").text(data.id)
                    $("#led-area .name-value").text(data.name)
                    $("#led-area .data-value").text(data.data)
                    $("#led-area .unit-value").text(data.unit)
                    break;
                case speakerFeed:
                    $("#speaker-area .id-value").text(data.id)
                    $("#speaker-area .name-value").text(data.name)
                    $("#speaker-area .data-value").text(data.data)
                    $("#speaker-area .unit-value").text(data.unit)
                    break;
                case lcdFeed:
                    $("#lcd-area .id-value").text(data.id)
                    $("#lcd-area .name-value").text(data.name)
                    $("#lcd-area .data-value").text(data.data)
                    $("#lcd-area .unit-value").text(data.unit)
                    break;
                case tempHumidFeed:
                    $("#temp-humid-area .id-value").text(data.id)
                    $("#temp-humid-area .name-value").text(data.name)
                    $("#temp-humid-area .data-value").text(data.data)
                    $("#temp-humid-area .unit-value").text(data.unit)
                    break;
                case gasFeed:
                    $("#gas-area .id-value").text(data.id)
                    $("#gas-area .name-value").text(data.name)
                    $("#gas-area .data-value").text(data.data)
                    $("#gas-area .unit-value").text(data.unit)
                    break;
                case drvFeed:
                    $("#drv-area .id-value").text(data.id)
                    $("#drv-area .name-value").text(data.name)
                    $("#drv-area .data-value").text(data.data)
                    $("#drv-area .unit-value").text(data.unit)
                    break;
                case relayFeed:
                    $("#relay-area .id-value").text(data.id)
                    $("#relay-area .name-value").text(data.name)
                    $("#relay-area .data-value").text(data.data)
                    $("#relay-area .unit-value").text(data.unit)
                    break;
                default:
                    break;
            }
        })
        $(".btn-success").removeAttr("disabled")
        axiosInstance = axios.create({
            headers: {
                "X-AIO-key": AIOkey
            },
            responseType: "json"
        });

        gasFeedUrl = feedsURL + "/" + $("#gas-feed-name").val() + "/data";
        ledFeedUrl = feedsURL + "/" + $("#led-feed-name").val() + "/data";
        lcdFeedUrl = feedsURL + "/" + $("#lcd-feed-name").val() + "/data";
        speakerFeedUrl = feedsURL + "/" + $("#speaker-feed-name").val() + "/data";
        tempHumidFeedUrl = feedsURL + "/" + $("#temp-humid-feed-name").val() + "/data";
        drvFeedUrl = feedsURL + "/" + $("#drv-feed-name").val() + "/data";
        relayFeedUrl = feedsURL + "/" + $("#relay-feed-name").val() + "/data";       
    }
})

$(document).ready(function(){
    $("#signal-switch").data("toggle", false);
    $("#signal-switch2").data("toggle", false);

    $(".form-control-range").change(function(e){
        const target = e.target;
        const h5Tag = $(target).siblings(".range-value");
        $(h5Tag).text($(target).val());
    })
    $("#post-led-data").click(async function(){
        if(axiosInstance!=null){
            const signal = parseInt($("#led-signal").val());
            const isSuccess = await postLedData(axiosInstance, ledFeedUrl, signal);
            if(isSuccess)
                alert("Success!")
            else
                alert("Failed!")
        }
    });
    $("#post-speaker-data").click(async function(){
        if(axiosInstance!=null){
            const level = parseInt($("#speaker-level").val());
            const isSuccess = await postSpeakerData(axiosInstance, speakerFeedUrl, level);
            if(isSuccess)
                alert("Success!")
            else
                alert("Failed!")
        }
    });
    $("#post-lcd-data").click(async function(){
        if(axiosInstance!=null){
            const message = $("#lcd-message").val();
            const isSuccess = await postLCDData(axiosInstance, lcdFeedUrl, message);
            if(isSuccess)
                alert("Success!")
            else
                alert("Failed!")
        }
    });
    $("#post-temp-humid-data").click(async function(){
        if(axiosInstance!=null){
            const tempValue = parseInt($("#temp-value").val());
            const humidValue = parseInt($("#humid-value").val());
            const isSuccess = await postTempAndHumidData(axiosInstance, tempHumidFeedUrl, tempValue, humidValue);
            if(isSuccess)
                alert("Success!")
            else
                alert("Failed!")
        }
    });  
    $("#signal-switch").change(function(e){
        const toggle = $(e.target).data("toggle");
        $(e.target).data("toggle", !toggle)
    })  
    $("#signal-switch2").change(function(e){
        const toggle = $(e.target).data("toggle");
        $(e.target).data("toggle", !toggle)
    })  

    $("#post-gas-data").click(async function(){
        if(axiosInstance!=null){
            const isOverThreshold = $("#signal-switch").data("toggle");
            const isSuccess = await postGasData(axiosInstance, gasFeedUrl, isOverThreshold);
            if(isSuccess)
                alert("Success!")
            else
                alert("Failed!")
        }
        else
            alert("Cannot post data to feed!")
    })

    $("#post-drv-data").click(async function(){
        if(axiosInstance!=null){
            const speed = parseInt($("#drv-value").val());
            const isSuccess = await postDRVData(axiosInstance, drvFeedUrl, speed);
            if(isSuccess)
                alert("Success!")
            else
                alert("Failed!")
        }
        else
            alert("Cannot post data to feed!")
    })

    $("#post-relay-data").click(async function(){
        if(axiosInstance!=null){
            const turnOn = $("#signal-switch2").data("toggle");
            const isSuccess = await postRelayData(axiosInstance, relayFeedUrl, turnOn);
            if(isSuccess)
                alert("Success!")
            else
                alert("Failed!")
        }
        else
            alert("Cannot post data to feed!")
    })
})