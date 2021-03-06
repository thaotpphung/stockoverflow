
function makeOHLCChart(stockinfo, len) {
  anychart.onDocumentReady(function () {
    // data
    var openArray = [];
    var closeArray = [];
    var highArray = [];
    var lowArray = [];
    var timeArray = [];
    for (i = 0; i < len; i++ ) {
      openArray.push((stockinfo.history[i].open/100).toFixed(2));
      closeArray.push((stockinfo.history[i].close));
      highArray.push((stockinfo.history[i].high));
      lowArray.push((stockinfo.history[i].low));
      timeArray.push(stockinfo.history[i].date);
    }

    var data = [];
    for (i = 0; i < len; i++) {
      data[i] = [timeArray[i], openArray[i],  highArray[i], lowArray[i], closeArray[i]];
    }

    // create a chart
    var chart = anychart.candlestick();
    // set the interactivity mode
    chart.interactivity("by-x");

    // create a japanese candlestick series and set the data
    var series = chart.candlestick(data);

    series.pointWidth(10);
    series.risingStroke("#3caea3");
    series.risingFill("rgb(98, 222, 208, 0.9)");
    series.fallingStroke("#FF0000");
    series.fallingFill("rgb(255, 0, 0, 0.5)");

    // set the chart title
    chart.title("Stock Price of " + stockinfo.symbol);
    // set the titles of the axes
    // chart.xAxis().title("Date");
    chart.yAxis().title("Stock Price ($)");
    // set the container id
    // var chartName = 'chart' + stockinfo.symbol;
    var chartName = 'OHLCchart';
    chart.container(chartName);
    // initiate drawing the chart
    chart.draw();
});
}

function makeLineChart(stockinfo, len) {
  // line chart
  var chartName = 'chart' + stockinfo.symbol;
  var ctx = document.getElementById(chartName).getContext('2d');
  ctx.canvas.width = 1000;
  ctx.canvas.height = 350;
  var openArray = [];
  var closeArray = [];
  var highArray = [];
  var lowArray = [];

  var timeArray = [];
  for (i = (len - 1); i >= 0; i--) {
    openArray.push((stockinfo.history[i].open / 100).toFixed(2));
    closeArray.push((stockinfo.history[i].close).toFixed(2));
    highArray.push((stockinfo.history[i].high).toFixed(2));
    lowArray.push((stockinfo.history[i].low).toFixed(2));
    timeArray.push(stockinfo.history[i].label);
  }
  
  var color;
  if (stockinfo.history[0].change < 0) {
    color = ["#FF0000"];
    backgroundcolor = ["rgb(255, 0, 0, 0.3)"];
  } else {
    color = ["#3caea3"];
    backgroundcolor = ["rgb(98, 222, 208, 0.5)"];
  }
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: timeArray,
      datasets: [
        {
          label: "Stock Price of " + stockinfo.symbol,
          data: openArray,
          borderColor: color,
          borderWidth: 2,
          backgroundColor: backgroundcolor,
          lineTension: 0,
          pointRadius: 0.5,
        }
      ],
    },
    options: {
      scales: {
        xAxes: [{
          ticks: {
            autoSkip: true,
            // maxTicksLimit: 50
          }
        }],
        yAxes: [
          {
            ticks: {
              callback: function (value, index, values) {
                return value + "$";
              },
            },
            scaleLabel: {
              display: true,
              labelString: "Openning Price ($)",
            },
          },
        ],
      },
    },
  });
}

function makeRatingChart(stockinfo) {
  const ctx = document.getElementById('ratingChart').getContext('2d');
  ctx.canvas.width = 800;
  ctx.canvas.height = 250;
  const ratingInfo = stockinfo.rating;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ratingInfo.ratingLabels,
      datasets: [
        {
          label: "Financial Modeling Prep Ratings",
          data: ratingInfo.ratingScores,
          fill: false,
          borderColor: ["rgb(255, 99, 132)", "rgb(255, 159, 64)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(54, 162, 235)", "rgb(153, 102, 255)", "rgb(201, 203, 207)"],
          borderWidth: 1,
          backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(255, 159, 64, 0.2)", "rgba(255, 205, 86, 0.2)", "rgba(75, 192, 192, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(153, 102, 255, 0.2)", "rgb(201, 203, 207, 0.2)"]
        },
      ],
    },
    options: {
      responsive: true,
      // maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
            max: 5,
            stepSize: 1,
            beginAtZero: true,
          },
          scaleLabel: {
            display: true,
            labelString: "Rating Score",
          },
        }],
      },
      tooltips: {
        callbacks: {
            label: function(tooltipItem, data) {
              const index = ratingInfo.ratingLabels.indexOf(tooltipItem.xLabel);
              var label = ratingInfo.ratingLabelsFull[index] || '';
              if (label) {
                  label += ': ';
              }
              label += ratingInfo.ratingRecommendation[index];
              return label;
            }
        }
      }
    }
  });
}

