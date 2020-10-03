const express = require("express"),
  router = express.Router({ mergeParams: true }),
  Stock = require("../models/stock"),
  User = require("../models/user"),
  StockSearch = require("../models/stocksearch"),
  middleware = require("../middleware"),
  got = require("got");
require("dotenv").config();

var USER_ID;
// INDEX - show all tracked stocks
router.get("/", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid)
    .populate("trackedstocks")
    .exec((err, user) => {
      USER_ID = req.params.userid;
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        res.render("stocks/index", { stocks: user.trackedstocks });
      }
    });
});

// SHOW ROUTE - show information of the chosen stock
router.get("/:stockid", middleware.checkCorrectUser, (req, res) => {
  Stock.findById(req.params.stockid, (err, foundStock) => {
    if (err || !foundStock) {
      req.flash("error", "Stock not found");
      res.redirect("back");
    } else {
      res.render("stocks/show", { stock: foundStock });
    }
  });
});

// DESTROY ROUTE - delete a tracked stock
router.delete("/:stockid", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      const index = user.trackedstocks.indexOf(req.params.stockid);
      if (index > -1) {
        user.trackedstocks.splice(index, 1);
        user.alerts.splice(index, 1);
        user.save();
      }
      req.flash("success", "Stock deleted");
      res.redirect("/users/" + req.params.userid + "/stocks");
    }
  });
});

// EDIT ROUTE - edit a tracked stock
router.put("/:stockid", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, async (err, user) => {
    if (err) {
      console.log(err);
    } else {
      const index = user.trackedstocks.indexOf(req.params.stockid);
      addToTrackedStocks(user, (index != - 1), req.params.stockid, null,  req, res);
    }
  });
});

// CREATE route - Add tracked stocks to the stocks db
router.post("/", middleware.checkCorrectUser, async (req, res) => {
  const queryStock = req.body.stock.symbol;
  const queryBody = req.body.stock;
  var user = await User.findById(req.params.userid).populate("trackedstocks");
  var newStock = await addToSharedStockDB(queryStock, queryBody);
  if ((queryBody.page === "transaction")) { // if the current page is the transaction page
    res.render("transactions/new", { stock: newStock, transaction: {totalquantity: 0} });
  } else { // the current page is the tracked stocks page
    addToTrackedStocks(user, existsInTrackedStocks(user.trackedstocks, queryStock), newStock._id, newStock, req, res);
  }
});

// add to tracked stocks if not already exists
async function addToTrackedStocks(user, existsInTrackedStocks, newStockId, newStock, req, res) {
  try {
    if (!existsInTrackedStocks) { // if it's not in trackedstocks
      user.trackedstocks.push(newStockId);
      // if the stock is added from the add purchase route
      if (newStock == null) {
        newStock = await Stock.findById(newStockId);
      } 
      user.alerts.push({symbol: newStock.symbol, name: newStock.name, stockid: newStockId});
      await user.save();
      req.flash("success", "Successfully added stock");
      res.redirect("/users/" + req.params.userid + "/stocks");
    } else { // stock already in trackedstocks
      req.flash("error", "Stock already exists");
      res.redirect("/users/" + req.params.userid + "/stocks");
    }
  } catch (err) {
    console.log("ERROR in addToTrackedStocks", err);
  }
}

// Checked if the query stock is in the tracked stock list by symbol
// return true if already exists in user's tracked stock
//        false if not exists in user's tracked stock
function existsInTrackedStocks(trackedstocks, queryStock){
  let counter = 0;
  trackedstocks.forEach((aStock) => {
    if (aStock.symbol == queryStock) {
      return;
    }
    counter++;
  });
  // go through and not find => not exist => return false
  return (counter === trackedstocks.length) ? false : true;
}

/* 
  Check if stock is in shared db 
    return foundstock if already exists
    return newly created stock if not 
*/
async function addToSharedStockDB(queryStock, queryBody){
  try{
    var newstock;
    const foundStock = await Stock.findOne({symbol: queryStock});
    if (foundStock) { // if found the stock, return it
      newstock = foundStock;
    } else { // if not, create the stock
      newstock = await createNewStock(queryBody, queryStock);
    }
    return newstock;
  } catch (err) {
    console.log(err);
  }
} 

const urlHead = "https://financialmodelingprep.com/api/v3/";
const apiKey = "?apikey=" + process.env.STOCK_API_KEY;
const quarterPeriod = "&period=quarter";
const limitOne = "&limit=1"

// parse data to json
async function getJSON(url) {
  var responsePromise = await got(url);
  return (JSON.parse(responsePromise.body));
}

// make API urls
function makeApiTimeSeriesUrl (queryStock) {
  const timeSeries = "historical-price-full/";
  const timeSeriesCount = "&timeseries=30";
  const apiTimeSeriesUrl = urlHead + timeSeries + queryStock + apiKey + timeSeriesCount;
  return apiTimeSeriesUrl
}
function makeApiRatingUrl (queryStock) {
  const rating = "rating/";
  const apiRatingUrl = urlHead + rating + queryStock + apiKey;
  return apiRatingUrl;
}
function makeApiProfileUrl (queryStock) {
  const profile = "profile/";
  const apiProfileUrl = urlHead + profile + queryStock + apiKey;
  return apiProfileUrl;
}
function makeApiKeyMetricsUrl (queryStock) {
  const keyMetrics = "key-metrics/";
  const apikeyMetricsUrl = urlHead + keyMetrics + queryStock + apiKey + quarterPeriod + limitOne;
  return apikeyMetricsUrl;
}
function makeApiFinancialGrowthUrl (queryStock) {
  const financialGrowth = "financial-growth/";
  const apiFinancialGrowthUrl = urlHead + financialGrowth + queryStock + apiKey + quarterPeriod + limitOne;
  return apiFinancialGrowthUrl
}

// Create new stock  
async function createNewStock(queryBody, queryStock) {
  try {
    // wait for all request to finish before processing data
    const results = await Promise.all([getJSON(makeApiTimeSeriesUrl(queryStock)), getJSON(makeApiKeyMetricsUrl(queryStock)),
      getJSON(makeApiProfileUrl(queryStock)), getJSON(makeApiRatingUrl(queryStock)),
      getJSON(makeApiFinancialGrowthUrl(queryStock))
     ]);
    const timeSeriesData = results[0]["historical"];  
    const keyMetricsData= results[1][0];
    const profileData = results[2][0];  
    const ratingData = results[3][0]; 
    const financialGrowthData = results[4][0];
    var newStock = await Stock.create(queryBody);
    setHistory(newStock, timeSeriesData);
    setKeyMetrics(newStock, keyMetricsData);
    setProfile(newStock, profileData);
    setRating(newStock, ratingData);
    setFinancialGrowth(newStock, financialGrowthData);
    const foundSearchStock = await StockSearch.findOne({ symbol: queryStock}); // get new stock's company name
    newStock.name = foundSearchStock.name.replace(/'/g, "%27");
    console.log('created this stock', newStock.name, 'Data:');
    newStock.save();
    return newStock;
  } catch (err) {
    console.log(err);
  }
}

async function setHistory(newStock, timeSeriesData) {
  return new Promise((resolve, reject) => {
    // update stock history data
    if (timeSeriesData) {
      timeSeriesData.forEach((aStock) => {
        const newHistoryEntry = 
          {
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
  return new Promise((resolve, reject) => {
    if ((profileData != null)) {
      const newProfileData = 
        {
          beta: formatNum(profileData["beta"]),  // => stability
          exchange: profileData["exchange"],  // "NASDAQ"
          industry: profileData["industry"], //"Consumer Electronics",
          website: encodeURI(profileData["website"]).replace(/'/g, "%27"), // "http://www.apple.com",
          description: encodeURI(profileData["description"]).replace(/'/g, "%27"), //"Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. It also sells various related services. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, HomePod, iPod touch, and other Apple-branded and third-party accessories. It also provides digital content stores and streaming services; AppleCare support services; and iCloud, a cloud service, which stores music, photos, contacts, calendars, mail, documents, and others. In addition, the company offers various service, such as Apple Arcade, a game subscription service; Apple Card, a co-branded credit card; Apple News+, a subscription news and magazine service; and Apple Pay, a cashless payment service, as well as licenses its intellectual property, and provides other related services. The company serves co",
          ceo: encodeURI(profileData["ceo"]).replace(/'/g, "%27"), // "Mr. Timothy D. Cook",
          sector: profileData["sector"], //"Technology",
          image: encodeURI(profileData["image"]), // "https://financialmodelingprep.com/image-stock/AAPL.jpg"
        }
      newStock.profile = newProfileData;
      if (newStock.profile) { 
        resolve(newStock);
      }
    }
  });
}

async function setKeyMetrics(newStock, keyMetricsData) {
  return new Promise((resolve, reject) => {
    // update key metrics data
    if ((keyMetricsData != null)) {
      const newKeyMetricsData = 
        { 
          date : keyMetricsData["date"],
          marketcap :  formatNum(keyMetricsData["marketCap"]),
          netincome: formatNum(keyMetricsData["netIncomePerShare"]), //  "Net Income per Share"
          EV:  formatNum(keyMetricsData["enterpriseValue"]), // Enterprise Value
          netDebtToEBITDA: formatNum(keyMetricsData["netDebtToEBITDA"]), // 0.695934725473018,
          DE :  formatNum(keyMetricsData["debtToEquity"]), // Debt to Equity
          DY : formatNum(keyMetricsData["dividendYield"]), //  Dividend Yield
          payoutratio : formatNum(keyMetricsData["payoutRatio"]),
          rev: formatNum(keyMetricsData["revenuePerShare"]),  // "Revenue per Share"
          FCFS : formatNum(keyMetricsData["freeCashFlowPerShare"]), // Free Cash Flow per Share
          BVS : formatNum(keyMetricsData["bookValuePerShare"]), // "Book Value per Share"
          PEratio : formatNum(keyMetricsData["peRatio"]), // price to earning ratio,
          PSratio : formatNum(keyMetricsData["priceToSalesRatio"]), // "Price to Sales Ratio"
          PBratio : formatNum(keyMetricsData["pbRatio"]), // price to book
          currratio: formatNum(keyMetricsData["currentRatio"]), // current ratio
          PFCFratio : formatNum(keyMetricsData["pfcfRatio"]),  //  price-to-cash flow
          roe: formatNum(keyMetricsData["roe"]) // return on equity
        };
      newStock.keymetrics = newKeyMetricsData;
      if (newStock.keyMetrics) {
        resolve(newStock);
      }
    }
  });
}

function setFinancialGrowth(newStock, financialGrowthData) {
  return new Promise((resolve, reject) => {
    // update financial growth data
    if ((financialGrowthData != null)) {
      const newFinancialGrowthData = 
        {
          date: financialGrowthData["date"], //"2019-09-28",
          revenueGrowth: formatNum(financialGrowthData["revenueGrowth"]),
          netIncomeGrowth: formatNum(financialGrowthData["netIncomeGrowth"]),
          dividendsperShareGrowth: formatNum(financialGrowthData["dividendsperShareGrowth"]),
          freeCashFlowGrowth: formatNum(financialGrowthData["freeCashFlowGrowth"]),
          grossProfitGrowth: formatNum(financialGrowthData["grossProfitGrowth"]),
          epsgrowth: formatNum(financialGrowthData["epsgrowth"]),
          debtGrowth: formatNum(financialGrowthData["debtGrowth"]),
          operatingCashFlowGrowth: formatNum(financialGrowthData["operatingCashFlowGrowth"]),
          operatingIncomeGrowth: formatNum(financialGrowthData["operatingIncomeGrowth"]),
          assetGrowth: formatNum(financialGrowthData["assetGrowth"]),
        }
      newStock.financialgrowth = newFinancialGrowthData;
      if (newStock.financialgrowth) {
        resolve(newStock);
      }
    }
  });
}

function setRating(newStock, ratingData) {
  return new Promise((resolve, reject) => {
    // update rating data
    if ((ratingData != null)) {
      const newRatingData = 
      {
        date: ratingData["date"], //"2020-07-17",
        "Overall Rating": ratingData["rating"],
        ratingScores: [ratingData["ratingScore"], ratingData["ratingDetailsDCFScore"], ratingData["ratingDetailsROEScore"], 
        ratingData["ratingDetailsROAScore"], ratingData["ratingDetailsDEScore"], ratingData["ratingDetailsPEScore"], 
        ratingData["ratingDetailsPBScore"]],
        ratingRecommendation: [ratingData["ratingRecommendation"], ratingData["ratingDetailsDCFRecommendation"], ratingData["ratingDetailsROERecommendation"], 
        ratingData["ratingDetailsROARecommendation"], ratingData["ratingDetailsDERecommendation"], ratingData["ratingDetailsPERecommendation"], 
        ratingData["ratingDetailsPBRecommendation"]],
        ratingLabels: [ "Overall", "DCF", "ROE", "ROA", "DE", "PE", "PB"],
        ratingLabelsFull: [ "Overall", "Discounted Cash Flow", "Return on Equity", "Return on Assets", "Debt to Equity", "Price Earning", "Price/Book"]
      }
      newStock.rating = newRatingData;
      if (newStock.rating) {
        resolve(newStock);
      }
    }
  });
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
  decimalPlaces = Math.pow(10,decimalPlaces);
  var abbreviation = [ "k", "M", "B", "T" ];
  for (var i = abbreviation.length - 1; i >= 0; i--) {
      var size = Math.pow(10, (i + 1) * 3);
      if(size <= number) {
        number = Math.round(number * decimalPlaces / size) / decimalPlaces;
        if((number == 1000) && (i < abbreviation.length - 1)) {
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
  if(USER_ID) {
    const user = await User.findById(USER_ID);
    const stockids = user.trackedstocks;
    stockids.forEach(async (stockid) => { 
      var newStock = await Stock.findById(stockid);
      const results = await Promise.all([getJSON(makeApiProfileUrl(newStock.symbol)), getJSON(makeApiKeyMetricsUrl(newStock.symbol)), getJSON(makeApiFinancialGrowthUrl(newStock.symbol))]);
      const profileData = results[0][0];  
      const keyMetricsData= results[1][0];
      const financialGrowthData = results[2][0];
      setProfile(newStock, profileData);
      setKeyMetrics(newStock, keyMetricsData);
      setFinancialGrowth(newStock, financialGrowthData);
      console.log("just updated quarterly: ", newStock.name);
    });
  }
}
// setInterval(UpdateQuarterly, 1000 * 60 * 60 * 24 * 30 * 4); // set quarterly update time
// 1s * 60 s per minute * 60 minutes per hour * 24 hour per day * 30 day per month * 4 month per quarter

async function UpdateDaily() {
  if(USER_ID) {
    const user = await User.findById(USER_ID);
    const stockids = user.trackedstocks;
    stockids.forEach(async (stockid) => { 
      var newStock = await Stock.findById(stockid);
      newStock.history = [];
      newStock.rating = [];
      const results = await Promise.all([getJSON(makeApiTimeSeriesUrl(newStock.symbol)),getJSON(makeApiRatingUrl(newStock.symbol))]);
      const timeSeriesData = results[0]["historical"];  
      const ratingData = results[1][0]; 
      setHistory(newStock, timeSeriesData);
      setRating(newStock, ratingData);
      console.log("just updated daily: ", newStock.name);
    });
  }
}
setInterval(UpdateDaily, 1000 * 60 * 60 * 24); // set daily update time
// 1s * 60 s per minute * 60 minutes per hour * 24 hour per day

module.exports = router;