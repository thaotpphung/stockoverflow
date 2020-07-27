
function makeGraph(stockinfo) {
  //   anychart.onDocumentReady(function () {
  //     // data
  //     var openArray = [];
  //     var closeArray = [];
  //     var highArray = [];
  //     var lowArray = [];
  //     var timeArray = [];
  //     for (i = (stockinfo.history.length - 1); i >= 0; i-- ) {
  //       openArray.push((stockinfo.history[i].open/100).toFixed(2));
  //       closeArray.push((stockinfo.history[i].close).toFixed(2));
  //       highArray.push((stockinfo.history[i].high).toFixed(2));
  //       lowArray.push((stockinfo.history[i].low).toFixed(2));
  //       timeArray.push(stockinfo.history[i].time);
  //     }

  //     var data = [];
  //     for (i = 0; i < (stockinfo.history.length); i++) {
  //       data[i] = [timeArray[i], openArray[i],  highArray[i], lowArray[i], closeArray[i] ];
  //     }

  //     // create a chart
  //     var chart = anychart.candlestick();
  //     // set the interactivity mode
  //     chart.interactivity("by-x");

  //     // create a japanese candlestick series and set the data
  //     var series = chart.candlestick(data);

  //     series.pointWidth(10);
  //     series.risingStroke("#3caea3");
  //     series.risingFill("rgb(98, 222, 208, 0.8)");
  //     series.fallingStroke("#FF0000");
  //     series.fallingFill("rgb(255, 0, 0, 0.4)");

  //     // set the chart title
  //     chart.title("Stock Price of " + stockinfo.symbol);

  //     // set the titles of the axes
  //     // chart.xAxis().title("Date");
  //     chart.yAxis().title("Openning Price ($)");

  //     // set the container id
  //     var chartName = 'chart' + stockinfo.symbol;
  //     document.getElementById(chartName).style.height = "350px";
  //     chart.container(chartName);

  //     // initiate drawing the chart
  //     chart.draw();
  // });
  // }

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
  for (i = (stockinfo.history.length - 1); i >= 0; i--) {
    openArray.push((stockinfo.history[i].open / 100).toFixed(2));
    closeArray.push((stockinfo.history[i].close).toFixed(2));
    highArray.push((stockinfo.history[i].high).toFixed(2));
    lowArray.push((stockinfo.history[i].low).toFixed(2));
    timeArray.push(stockinfo.history[i].time);
  }
  var color;
  if (stockinfo.history[0].change < 0) {
    color = ["#FF0000"];
    backgroundcolor = ["rgb(255, 0, 0, 0.2)"];
  } else {
    color = ["#3caea3"];
    backgroundcolor = ["rgb(98, 222, 208, 0.5)"];
  }
  var chart = new Chart(ctx, {
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
        xAxes: [
          {

          }
        ],
      },
    },
  });
}

function makeRatingChart(stockinfo) {
  const ctx = document.getElementById('ratingChart').getContext('2d');
  ctx.canvas.width = 1000;
  ctx.canvas.height = 250;
  const ratingInfo = stockinfo.rating;
  const ratingChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ratingInfo.ratingLabels,
      datasets: [
        {
          label: "Rating of " + stockinfo.symbol,
          data: ratingInfo.ratingScores,
          fill: false,
          borderColor: ["rgb(255, 99, 132)", "rgb(255, 159, 64)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(54, 162, 235)", "rgb(153, 102, 255)"],
          borderWidth: 1,
          backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(255, 159, 64, 0.2)", "rgba(255, 205, 86, 0.2)", "rgba(75, 192, 192, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(153, 102, 255, 0.2)"]
        },
      ],
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
            max: 5,
            stepSize: 1,
            beginAtZero: true
          }
        }]
      }
    }
  });
}
