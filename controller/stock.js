const Stock = require("../models/stock"),
  StockSearch = require("../models/stocksearch"),
  StockMarket = require("../models/stockmarket"),
  got = require("got");
require("dotenv").config();// get detail of stock by stockid

exports.getStockById = async (req, res) => {
  try {
    let stock = await Stock.findById(req.params.stockid);
    res.render("stocks/show", { stock: stock });
  } catch (err) {
    req.flash("error", "Stock not found");
    res.redirect("back");
  }
}

// add stock when finding purchase or when
exports.addStock = async (req, res) => {
  try {
    await this.addStockHelper(req.body.stock.symbol);
    req.flash("success", "Successfully made action");
    res.redirect("/users/" + req.params.userid + "/transactions");
  } catch (err) {
    req.flash("error", "Error occured, please try again");
    res.redirect("back");
  }
}

exports.addStockHelper = async (symbol) => {
  try {
    const timeSeries = await getJSON(makeApiTimeSeriesUrl(symbol));
    const timeSeriesData = timeSeries["historical"];
    const keyMetrics = await getJSON(makeApiKeyMetricsUrl(symbol));
    const keyMetricsData = keyMetrics[0];
    const profile = await getJSON(makeApiProfileUrl(symbol));
    const profileData = profile[0];
    const rating =  await getJSON(makeApiRatingUrl(symbol));
    const ratingData  = rating[0];
    const financialGrowth = await getJSON(makeApiFinancialGrowthUrl(symbol));
    const financialGrowthData = financialGrowth[0];
    let newStock = await Stock.create({symbol: symbol});
    await setHistory(newStock, timeSeriesData);
    setKeyMetrics(newStock, keyMetricsData);
    setProfile(newStock, profileData);
    setRating(newStock, ratingData);
    setFinancialGrowth(newStock, financialGrowthData);
    const foundSearchStock = await StockSearch.findOne({ symbol: symbol }); // get new stock's company name
    newStock.name = foundSearchStock.name.replace(/'/g, "%27");
    console.log("created this stock: ", newStock.name);
    newStock.save();
    return newStock;
  } catch (err) {
    console.log(err);
  }
}

const urlHead = "https://financialmodelingprep.com/api/v3/";
const apiKey = "?apikey=" + process.env.STOCK_API_KEY;
const quarterPeriod = "&period=quarter";
const limitOne = "&limit=1";

// parse data to json
async function getJSON(url) {
  var responsePromise = await got(url);
  return JSON.parse(responsePromise.body);
}

// make API urls
function makeApiTimeSeriesUrl(symbol) {
  const timeSeries = "historical-price-full/";
  const timeSeriesCount = "&timeseries=30";
  const apiTimeSeriesUrl =
    urlHead + timeSeries + symbol + apiKey + timeSeriesCount;
  return apiTimeSeriesUrl;
}

function makeApiRatingUrl(symbol) {
  const rating = "rating/";
  const apiRatingUrl = urlHead + rating + symbol + apiKey;
  return apiRatingUrl;
}

function makeApiProfileUrl(symbol) {
  const profile = "profile/";
  const apiProfileUrl = urlHead + profile + symbol + apiKey;
  return apiProfileUrl;
}

function makeApiKeyMetricsUrl(symbol) {
  const keyMetrics = "key-metrics/";
  const apikeyMetricsUrl =
    urlHead + keyMetrics + symbol + apiKey + quarterPeriod + limitOne;
  return apikeyMetricsUrl;
}

function makeApiFinancialGrowthUrl(symbol) {
  const financialGrowth = "financial-growth/";
  const apiFinancialGrowthUrl =
    urlHead + financialGrowth + symbol + apiKey + quarterPeriod + limitOne;
  return apiFinancialGrowthUrl;
}

async function setHistory(newStock, timeSeriesData) {
  return new Promise((resolve, reject) => {
    // update stock history data
    if (timeSeriesData) {
      timeSeriesData.forEach((aStock) => {
        const newHistoryEntry = {
          date: aStock["date"],
          label: aStock["label"],
          open: Math.round(aStock["open"] * 100),
          high: aStock["high"].toFixed(2),
          low: aStock["low"].toFixed(2),
          close: aStock["close"].toFixed(2),
          vwap: formatNum(aStock["vwap"]),
          adjClose: formatNum(aStock["adjClose"]),
          volume: formatNum(aStock["volume"]),
          unadjustedVolume: formatNum(aStock["unadjustedVolume"]),
          change: aStock["change"].toFixed(2),
          changepercent: aStock["changePercent"].toFixed(2),
        };
        newStock.history.push(newHistoryEntry);
        if (newStock.history.length == 30) {
          resolve(newStock);
        }
      });
    }
  });
}

async function setProfile(newStock, profileData) {
  // update profile data
  // return new Promise((resolve, reject) => {
  if (profileData != null) {
    const newProfileData = {
      beta: formatNum(profileData["beta"]), // => stability
      exchange: profileData["exchange"], // "NASDAQ"
      industry: profileData["industry"], //"Consumer Electronics",
      website: encodeURI(profileData["website"]).replace(/'/g, "%27"),
      description: encodeURI(profileData["description"]).replace(/'/g, "%27"),
      ceo: encodeURI(profileData["ceo"]).replace(/'/g, "%27"), // "Mr. Timothy D. Cook",
      sector: profileData["sector"], //"Technology",
      image: encodeURI(profileData["image"]),
    };
    newStock.profile = newProfileData;
    // resolve();
  }
  // });
}

async function setKeyMetrics(newStock, keyMetricsData) {
  if (keyMetricsData != null) {
    const newKeyMetricsData = {
      date: keyMetricsData["date"],
      marketcap: formatNum(keyMetricsData["marketCap"]),
      netincome: formatNum(keyMetricsData["netIncomePerShare"]), //  "Net Income per Share"
      EV: formatNum(keyMetricsData["enterpriseValue"]), // Enterprise Value
      netDebtToEBITDA: formatNum(keyMetricsData["netDebtToEBITDA"]), // 0.695934725473018,
      DE: formatNum(keyMetricsData["debtToEquity"]), // Debt to Equity
      DY: formatNum(keyMetricsData["dividendYield"]), //  Dividend Yield
      payoutratio: formatNum(keyMetricsData["payoutRatio"]),
      rev: formatNum(keyMetricsData["revenuePerShare"]), // "Revenue per Share"
      FCFS: formatNum(keyMetricsData["freeCashFlowPerShare"]), // Free Cash Flow per Share
      BVS: formatNum(keyMetricsData["bookValuePerShare"]), // "Book Value per Share"
      PEratio: formatNum(keyMetricsData["peRatio"]), // price to earning ratio,
      PSratio: formatNum(keyMetricsData["priceToSalesRatio"]), // "Price to Sales Ratio"
      PBratio: formatNum(keyMetricsData["pbRatio"]), // price to book
      currratio: formatNum(keyMetricsData["currentRatio"]), // current ratio
      PFCFratio: formatNum(keyMetricsData["pfcfRatio"]), //  price-to-cash flow
      roe: formatNum(keyMetricsData["roe"]), // return on equity
    };
    newStock.keymetrics = newKeyMetricsData;
  }
}

function setFinancialGrowth(newStock, financialGrowthData) {
  if (financialGrowthData != null) {
    const newFinancialGrowthData = {
      date: financialGrowthData["date"], //"2019-09-28",
      revenueGrowth: formatNum(financialGrowthData["revenueGrowth"]),
      netIncomeGrowth: formatNum(financialGrowthData["netIncomeGrowth"]),
      dividendsperShareGrowth: formatNum(
        financialGrowthData["dividendsperShareGrowth"]
      ),
      freeCashFlowGrowth: formatNum(financialGrowthData["freeCashFlowGrowth"]),
      grossProfitGrowth: formatNum(financialGrowthData["grossProfitGrowth"]),
      epsgrowth: formatNum(financialGrowthData["epsgrowth"]),
      debtGrowth: formatNum(financialGrowthData["debtGrowth"]),
      operatingCashFlowGrowth: formatNum(
        financialGrowthData["operatingCashFlowGrowth"]
      ),
      operatingIncomeGrowth: formatNum(
        financialGrowthData["operatingIncomeGrowth"]
      ),
      assetGrowth: formatNum(financialGrowthData["assetGrowth"]),
    };
    newStock.financialgrowth = newFinancialGrowthData;
  }
}

function setRating(newStock, ratingData) {
  if (ratingData != null) {
    const newRatingData = {
      date: ratingData["date"], //"2020-07-17",
      "Overall Rating": ratingData["rating"],
      ratingScores: [
        ratingData["ratingScore"],
        ratingData["ratingDetailsDCFScore"],
        ratingData["ratingDetailsROEScore"],
        ratingData["ratingDetailsROAScore"],
        ratingData["ratingDetailsDEScore"],
        ratingData["ratingDetailsPEScore"],
        ratingData["ratingDetailsPBScore"],
      ],
      ratingRecommendation: [
        ratingData["ratingRecommendation"],
        ratingData["ratingDetailsDCFRecommendation"],
        ratingData["ratingDetailsROERecommendation"],
        ratingData["ratingDetailsROARecommendation"],
        ratingData["ratingDetailsDERecommendation"],
        ratingData["ratingDetailsPERecommendation"],
        ratingData["ratingDetailsPBRecommendation"],
      ],
      ratingLabels: ["Overall", "DCF", "ROE", "ROA", "DE", "PE", "PB"],
      ratingLabelsFull: [
        "Overall",
        "Discounted Cash Flow",
        "Return on Equity",
        "Return on Assets",
        "Debt to Equity",
        "Price Earning",
        "Price/Book",
      ],
    };
    newStock.rating = newRatingData;
  }
}

function formatNum(number) {
  if (number == null) {
    return "-";
  } else {
    if (number >= 1000) {
      return abbreviateNum(number, 2);
    }
    return number.toFixed(2);
  }
}

function abbreviateNum(number, decimalPlaces) {
  decimalPlaces = Math.pow(10, decimalPlaces);
  var abbreviation = ["k", "M", "B", "T"];
  for (var i = abbreviation.length - 1; i >= 0; i--) {
    var size = Math.pow(10, (i + 1) * 3);
    if (size <= number) {
      number = Math.round((number * decimalPlaces) / size) / decimalPlaces;
      if (number == 1000 && i < abbreviation.length - 1) {
        number = 1;
        i++;
      }
      number += abbreviation[i];
      break;
    }
  }
  return number;
}

async function UpdateQuarterly() {
  const stocks = await Stock.find({});
  stocks.forEach(async (stock) => {
    var newStock = await Stock.findOne({ symbol: stock.symbol });
    const results = await Promise.all([
      getJSON(makeApiProfileUrl(newStock.symbol)),
      getJSON(makeApiKeyMetricsUrl(newStock.symbol)),
      getJSON(makeApiFinancialGrowthUrl(newStock.symbol)),
    ]);
    const profileData = results[0][0];
    const keyMetricsDta = results[1][0];
    const financialGrowthData = results[2][0];
    setProfile(newStock, profileData);
    setKeyMetrics(newStock, keyMetricsData);
    setFinancialGrowth(newStock, financialGrowthData);
    console.log("just updated quarterly: ", newStock.name);
  });
}
// setInterval(UpdateQuarterly, 1000 * 60 * 60 * 24 * 30 * 4); // set quarterly update time
// 1s * 60 s per minute * 60 minutes per hour * 24 hour per day * 30 day per month * 4 month per quarter

async function UpdateDaily() {
  const stocks = await Stock.find({});
  stocks.forEach(async (stock) => {
    var newStock = await Stock.findOne({ symbol: stock.symbol });
    newStock.history = [];
    newStock.rating = [];
    const results = await Promise.all([
      getJSON(makeApiTimeSeriesUrl(newStock.symbol)),
      getJSON(makeApiRatingUrl(newStock.symbol)),
    ]);
    const timeSeriesData = results[0]["historical"];
    const ratingData = results[1][0];
    setHistory(newStock, timeSeriesData);
    setRating(newStock, ratingData);
    console.log("just updated daily: ", newStock.name);
  });
}
// setInterval(UpdateDaily, 1000 * 60 * 60 * 24); // set daily update time
// 1s * 60 s per minute * 60 minutes per hour * 24 hour per day

async function UpdateStockMarket() {
  await StockMarket.deleteOne({});
  const stockmarket = await StockMarket.create({});

  const apiActiveUrl = urlHead + "actives" + apiKey;
  const apiGainerUrl = urlHead + "gainers" + apiKey;
  const apiLoserUrl = urlHead + "losers" + apiKey;

  const results = await Promise.all([
    getJSON(apiActiveUrl),
    getJSON(apiGainerUrl),
    getJSON(apiLoserUrl),
  ]);

  const mostactiveData = results[0];
  const mostgainerData = results[1];
  const mostloserData = results[2];

  for (var i = 0; i < 5; i++) {
    let mostactive = mostactiveData[i];
    let newMostActiveEntry = {
      symbol: mostactive.ticker,
      changesPercentage: mostactive.changesPercentage.slice(1, -2),
      price: mostactive.price,
    };
    stockmarket.mostactive.push(newMostActiveEntry);

    let mostgainer = mostgainerData[i];
    let newMostGainerEntry = {
      symbol: mostgainer.ticker,
      changesPercentage: mostgainer.changesPercentage.slice(1, -2),
      price: mostgainer.price,
    };
    stockmarket.mostgainer.push(newMostGainerEntry);

    let mostloser = mostloserData[i];
    let newMostLoserEntry = {
      symbol: mostloser.ticker,
      changesPercentage: mostloser.changesPercentage.slice(1, -2),
      price: mostloser.price,
    };
    stockmarket.mostloser.push(newMostLoserEntry);
  }

  stockmarket.save();

  console.log("DONE UPDATE STOCK MARKET");
}

// setInterval(UpdateStockMarket, 10000);