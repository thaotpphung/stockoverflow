
function makeGraph(stockinfo, ctx) {
  console.log('info', stockinfo);
  var chartName = 'chart' + stockinfo.symbol;
  var ctx = document.getElementById(chartName).getContext('2d');
  ctx.canvas.width = 1000;
  ctx.canvas.height = 350;
  var priceArray = [];
  var timeArray = [];
  for (i = (stockinfo.history.length - 1); i >= 0; i-- ) {
    priceArray.push((stockinfo.history[i].price/100).toFixed(2));
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
          data: priceArray,
          borderColor: color,
          borderWidth: 2,
          backgroundColor: backgroundcolor ,
          lineTension: 0,
          pointRadius: 0.5,
        },
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
          {}
        ],
      },
    },
  });
}
