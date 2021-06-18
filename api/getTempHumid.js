const { Temperature } = require("../models/Models");


// mqtt
const mqtt = require("mqtt");

const app = require("../app")
const PORT = process.env.PORT || 3001;

const username = "navcul3108";
const key = process.env.ADAFRUIT_KEY;
const url = `mqtts://${username}:${key}@io.adafruit.com`;

var client = mqtt.connect(url);

client.on("connect", function () {
    const cbhn = `${username}/feeds/kkllm-iot-temp-humid`;
    client.subscribe(cbhn, function (err) {
        if (err) {
        console.error(err);
        }
    });
});

let listTemp = []

client.on("message", function(topic, message) {
    let s = message.toString();
    s = s.slice(s.indexOf('"data"') + 8);
    s = s.slice(0, s.indexOf("-"));
    listTemp.push(parseInt(s));

})

let timeLoop = 60 * 1000;
setInterval(function() {
  let timestamp = new Date();
  let valueAdd = listTemp.length > 0 ? Math.max(...listTemp) : -1;
  Temperature.add({
    timestamp,
    temperature: valueAdd
  })
  listTemp = [];
}, timeLoop);


app.listen(PORT, () => {
    console.log(`ONLINE`);
})