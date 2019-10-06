var a1Slider = document.getElementById("a1");
var a2Slider = document.getElementById("a2");
var freq1Slider = document.getElementById("w1");
var bitsSilder = document.getElementById("bitsVal");
var minADCVal = document.getElementById("minVal");
var sampFreqSlider = document.getElementById("sampleW");
var maxADCVal = document.getElementById("maxVal");
var messageEn = document.getElementById("messageEn");
var signalEn = document.getElementById("signalEn");
var quantEn = document.getElementById("quantEn");
var adcEn = document.getElementById("adcEn");
var mathField = document.getElementById("mathBox");

let defaultEqn = math.parse('a1*cos(w*t)^2+a2*cos(w*t)');
var compedMath = defaultEqn.compile();

// HTML Labels
var a1Label = document.getElementById("a1Val");
var a2Label = document.getElementById("a2Val");
var freqLabel = document.getElementById("freqVal");
var sampleFreqLabel = document.getElementById("sampleVal");
var bitValLabel = document.getElementById("bitVal");
var minADCLabel = document.getElementById("adcMin");
var manADCLabel = document.getElementById("adcMax");

var ctx = document.getElementById("chart").getContext('2d');

var arraySize = 100;
const viewPeriod = 1;

var a1Val = parseInt(a1Slider.value, 10);
var a2Val = parseInt(a2Slider.value, 10);
var freq = parseInt(freq1Slider.value, 10);
var sampFreq = parseInt(sampFreqSlider.value, 10);
var bitVal = parseInt(bitsSilder.value, 10);
var minADC = parseInt(minADCVal.value, 10);
var maxADC = parseInt(maxADCVal.value, 10);

minADCVal.setAttribute("max", maxADC-1);
maxADCVal.setAttribute("min", minADC+1);

updateLabels();

var data = new Array(arraySize);
var maxADCLine = new Array(arraySize+1);
var minADCLine = new Array(arraySize+1);
var label = new Array(arraySize);
var sampledData = new Array(numSamples);
var quantData = new Array(numSamples);

//Calcs
var period = (2*Math.PI) / freq;
var maxFreqRad = 2 * freq;
var maxFreq = maxFreqRad / (2 * Math.PI);
var nyquistFreq = 2 * maxFreq;
var sampPeriod = 1 / sampFreq; 
var numSamples = sampFreq / viewPeriod;

createData();

var chart = new Chart(ctx, {
    type: 'scatter',
    data: {
        labels: label,
        datasets: [{
            data: data,
            label: "Message Data",
            borderColor: '#00ffc5',
            fill: false,
            pointRadius: 0,
            showLine: true,
        },
        {
            data: minADCLine,
            label: "ADC Limit - Min",
            borderColor: '#eb231c',
            fill: false,
            showLine: true,            
        },
        {
            data: maxADCLine,
            label: "ADC Limit - Max",
            borderColor: '#eb231c',
            fill: '-1',
            showLine: true,
        },
        {
            data: sampledData,
            label: "Sampled Data",
            borderColor: '#d3d3d3',
            showLine: false,
        },
        {
            data: quantData,
            label: "Quantised Data",
            borderColor: '#12c6de',
            showLine: true,
            lineTension: 0,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            xAxes: [{
                ticks: {
                    max: viewPeriod,
                }
            }],
        },
        legend: {
            onClick: function(event, legendItem) {}
        },
    }
});

adcEnClick();
quantEnClick();
messageEnClick();
signalEnClick();

function adcEnClick() {
    if (!adcEn.checked) {
        chart.getDatasetMeta(2).hidden = true;
        chart.getDatasetMeta(1).hidden = true;
    } else {
        chart.getDatasetMeta(2).hidden = false;
        chart.getDatasetMeta(1).hidden = false;
    }
    chart.update();
}

function quantEnClick() {
    if (!quantEn.checked) {
        chart.getDatasetMeta(4).hidden = true;
    } else {
        chart.getDatasetMeta(4).hidden = false;
    }
    chart.update();
}

function messageEnClick() {
    if (!messageEn.checked) {
        chart.getDatasetMeta(0).hidden = true;
    } else {
        chart.getDatasetMeta(0).hidden = false;
    }
    chart.update();
}

function signalEnClick() {
    if (!signalEn.checked) {
        chart.getDatasetMeta(3).hidden = true;
    } else {
        chart.getDatasetMeta(3).hidden = false;
    }
    chart.update();
}

a1Slider.oninput = function() {
    a1Val = parseInt(this.value,10);
    updateLabels();
    createData();
    updateChart();
}

a2Slider.oninput = function() {
    a2Val = parseInt(this.value, 10);
    updateLabels();
    createData();
    updateChart();
}

freq1Slider.oninput = function() {
    freq = parseInt(this.value, 10);
    updateVals();
    updateLabels();
    createData();
    updateChart();
}

bitsSilder.oninput = function() {
    bitVal = parseInt(this.value, 10);
    updateVals();
    updateLabels();
    createData();
    updateChart();
}

minADCVal.oninput = function() {
    minADC = parseInt(this.value, 10);
    maxADCVal.setAttribute("min", minADC+1);
    updateLabels();
    createData();
    updateChart();
}

sampFreqSlider.oninput = function() {
    sampFreq = parseInt(this.value, 10);
    updateVals();
    updateLabels();
    createData();
    updateChart();
}

maxADCVal.oninput = function() {
    maxADC = parseInt(this.value, 10);
    minADCVal.setAttribute("max", maxADC-1);
    updateLabels();
    createData();
    updateChart();
}

function updateVals() {
    period = (2*Math.PI) / freq;
    maxFreqRad = 2 * freq;
    maxFreq = maxFreqRad / (2 * Math.PI);
    nyquistFreq = 2 * maxFreq;
    sampPeriod = 1 / sampFreq;
    numSamples = sampFreq / viewPeriod;
}

function roundTo(value, num) {
    var resto = value%num;
    if (resto <= (num/2)) { 
        let out = Math.round((value-resto+0.00001)*100)/100;
        if (num < 0) {
            out = 0-out;
        }
        return out;
    } else {
        let out = Math.round((value+num-resto+0.00001)*100)/100;
        if (num < 0) {
            out = 0-out
        }
        return out;
    }
}

function createData() {
    let sampleRange = maxADC - minADC;
    let levels = Math.pow(2, bitVal);
    let step = (maxADC - minADC) / (levels - 1);
    var j = 0

    for (i = 0; i <= viewPeriod; i+=(viewPeriod/arraySize)) {

        let scope = {
            a1: a1Val,
            w: freq,
            t: i,
            a2: a2Val
        }

        let outData = compedMath.evaluate(scope); //a1Val * Math.pow(Math.cos(freq*i), 2) + a2Val * Math.cos(freq*i);
        let outLabel = i;
        label[j] = outLabel;
        data[j] = {x: outLabel, y: outData};
        maxADCLine[j] = {x: outLabel, y: maxADC};
        minADCLine[j] = {x: outLabel, y: minADC};
        j++;
    }
    maxADCLine[j+1] = {x: 1, maxADC};
    minADCLine[j+1] = {x: 1, minADC};
    sampledData = [];
    quantData = [];
    var j, k = 0
    quantData = [];
    for (i = 0; i <= viewPeriod; i += viewPeriod/numSamples) {

        let scope = {
            a1: a1Val,
            w: freq,
            t: i,
            a2: a2Val
        }

        let xVal = compedMath.evaluate(scope);//a1Val * Math.pow(Math.cos(freq*i), 2) + a2Val * Math.cos(freq*i)
        sampledData[j] = {x: i, y: xVal};
        let quantSample = roundTo(Math.min(Math.max(xVal, minADC), maxADC)-minADC, step)+minADC;
        if (k != 0) {
            quantData[k] = {x: i, y: quantData[k-1]};
            k++
        }
        quantData[k] = {x: i, y: quantSample};
        k++;
        j++;
    }
}

function updateLabels() {
    a1Label.innerHTML = "A₁ Value: " + a1Val;
    a2Label.innerHTML = `A₂ Value: ${a2Val}`;
    freqLabel.innerHTML = `Frequency: ${freq}rads⁻¹`;
    sampleFreqLabel.innerHTML = `Sample Frequency: ${sampFreq}rads⁻¹`;
    bitValLabel.innerHTML = "ADC Bits: " + bitVal;
    minADCLabel.innerHTML = "ADC Min: " + minADC;
    manADCLabel.innerHTML = "ADC Max: " + maxADC;
}

function updateChart() {
    chart.data.datasets[0].data = data;
    chart.data.datasets[1].data = minADCLine;
    chart.data.datasets[2].data = maxADCLine;
    chart.data.datasets[3].data = sampledData;
    chart.data.datasets[4].data = quantData;
    chart.update();
}

var compedMath;

function updateMath() {
    let tempMath = math.parse(mathField.value);
    compedMath = tempMath.compile();
    createData();
    updateChart();
}

function openSettings() {
    document.getElementById("settings").style.width = "50%";
    document.getElementById("Chart").style.filter = "blur(0.4rem)";
    open = true;
}

var open = false;

function closeSettings() {
    if (open) {
        document.getElementById("settings").style.width = "0";
        document.getElementById("Chart").style.filter = "blur(0rem)";
    }

}