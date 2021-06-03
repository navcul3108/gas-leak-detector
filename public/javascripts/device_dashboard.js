// Our labels along the x-axis
var years = [1500,1600,1700,1750,1800,1850,1900,1950,1999,2050];
// For drawing the lines
var africa = [86,114,106,106,107,111,133,221,783,2478];

$(document).ready(function(){
    const param = {
        start_at: 0;
    }
    $.get("/https://io.adafruit.com/api/v2/navcul3108/feeds/kkllm-iot-temp-humid/data/chart",
            )
})

let chart = new Chart(document.getElementById("temp-chart"), {
    type: "line",
    data: {
        labels: years,
        datasets: [
            {
                label: "Nhiệt độ",
                data: africa,
                backgroundColor: "rgba(247, 37, 133, 1)",
                borderColor: "#F72585",
            }
        ],
    },
    options: {
        responsive: true,
        plugin:{
            title:{
                display: true,
                text: "Temperature"
            }
        }
    }
})