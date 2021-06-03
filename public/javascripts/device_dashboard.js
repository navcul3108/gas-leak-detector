var mqttClient = null, chart = null;
const tempHumidFeed = "navcul3108/feeds/kkllm-iot-temp-humid";
const gasFeed = "navcul3108/feeds/kkllm-iot-gas";
const relayFeed = "navcul3108/feeds/kkllm-iot-relay";
const gasSelector = "#gas-status", valveSelector = "#valve-status",
  pumpSelector = "#pump-status", ventilitationSelector = "#ventilitation-status";

function errCb(err) {
  if (err)
    console.error(err);
}

const parseCSVToJSON = function (csvLine) {
  const splittedArr = csvLine.split(",");
  // Remove duplicate double quote
  let jsonDataStr = splittedArr.slice(0, splittedArr.length - 3).join(",").replace(/""/g, '"');
  if (jsonDataStr.startsWith('"'))
    jsonDataStr = jsonDataStr.substr(1);
  if (jsonDataStr.endsWith('"'))
    jsonDataStr = jsonDataStr.substr(0, jsonDataStr.length - 1);

  const dataObj = JSON.parse(jsonDataStr);
  return dataObj
}

function subscribeMqtt() {
  const wsUrl = "ws://navcul3108:aio_efhI17dXi8i3ZtaHW94rXiLzFTjq@io.adafruit.com";
  mqttClient = mqtt.connect(wsUrl);

  mqttClient.subscribe(tempHumidFeed)
  mqttClient.subscribe(gasFeed)
  mqttClient.subscribe(relayFeed)

  mqttClient.on("message", function (topic, payload) {
    try {
      const jsonObj = JSON.parse(payload.toString())
      console.log('jsonObj :>> ', jsonObj);
      switch (topic) {
        case tempHumidFeed:
          const [temp, humid] = jsonObj.data.split("-");
          const now = new Date().toLocaleString();
          chart.data.datasets[0].data.push(temp)
          chart.data.datasets[1].data.push(humid)
          chart.data.labels.push(now)
          chart.update()
          break;
        case gasFeed:
          if(jsonObj.data==="0"){
            $(gasSelector).removeClass("danger")
            $(gasSelector).addClass("normal")
          }
          else{
            $(gasSelector).removeClass("normal")
            $(gasSelector).addClass("danger")
          }
          break;
        case relayFeed:
          if(jsonObj.data==="0"){
            $(pumpSelector).removeClass("on")
            $(pumpSelector).addClass("off")
            $(ventilitationSelector).removeClass("on")
            $(ventilitationSelector).addClass("off")
            $(valveSelector).removeClass("on")
            $(valveSelector).addClass("off")
          }
          else{
            $(pumpSelector).removeClass("off")
            $(pumpSelector).addClass("on")
            $(ventilitationSelector).removeClass("off")
            $(ventilitationSelector).addClass("on")
            $(valveSelector).removeClass("off")
            $(valveSelector).addClass("on")
          }
          break;
        default: break;
      }
    }
    catch (err) {
      console.error(err.message);
      alert(err.message)
    }
  })
}

function initalizeDeviceState() {
  $.get("https://io.adafruit.com/api/v2/navcul3108/feeds/kkllm-iot-gas/data/retain",
    function (data) {
      const jsonObj = parseCSVToJSON(data)
      if (jsonObj.data === "0")
        $(gasSelector).addClass("normal")
      else
        $(gasSelector).addClass("danger")
    })
  $.get("https://io.adafruit.com/api/v2/navcul3108/feeds/kkllm-iot-relay/data/retain",
    function (data) {
      const jsonObj = parseCSVToJSON(data)
      if (jsonObj.data === "0"){
        $(valveSelector).addClass("off")
        $(ventilitationSelector).addClass("off")
        $(pumpSelector).addClass("off")
      }
      else{
        $(valveSelector).addClass("on")
        $(ventilitationSelector).addClass("on")
        $(pumpSelector).addClass("on")
      } 
    })
  $.get("https://io.adafruit.com/api/v2/navcul3108/feeds/kkllm-iot-drv/data/retain",
    function (data) {
      const jsonObj = parseCSVToJSON(data)
      if (jsonObj.data === "0") $(ventilitationSelector).addClass("off")
      else $(ventilitationSelector).addClass("on")
    })
}

function initializeChart(feedData) {
  const chartData = feedData
    .map((data) => {
      const [temp, humid] = JSON.parse(data.value).data.split("-");
      return {
        temp: parseInt(temp),
        humid: parseInt(humid),
        time: new Date(data.created_at).toLocaleString()
      }
    })
    .reverse()
  let tempData = [], humidData = [], labels = [];
  chartData.forEach((val) => {
    tempData.push(val.temp)
    humidData.push(val.humid)
    labels.push(val.time)
  })
  chart = new Chart(document.getElementById("temp-chart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Nhiệt độ",
          data: tempData,
          backgroundColor: "#ff7b00",
          borderColor: "#ff7b00",
        },
        {
          label: "Độ ẩm",
          data: humidData,
          backgroundColor: "#00b4d8",
          borderColor: "#00b4d8",
        }

      ],
    },
    options: {
      responsive: true,
      plugin: {
        title: {
          display: true,
          text: "Nhiệt độ và độ ẩm"
        },
        legend: {
          labels: {
            font: {
              size: 8
            }
          }
        }
      }
    }
  })
}

$(document).ready(function () {
    initalizeDeviceState();
    $.get("https://io.adafruit.com/api/v2/navcul3108/feeds/kkllm-iot-temp-humid/data?limit=20",initializeChart)
      .done(function () {
        subscribeMqtt()
      })

})

