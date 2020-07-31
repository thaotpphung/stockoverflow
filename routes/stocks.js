const express = require("express"),
  router = express.Router({ mergeParams: true }),
  Stock = require("../models/stock"),
  User = require("../models/user"),
  StockSearch = require("../models/stocksearch"),
  middleware = require("../middleware"),
  got = require("got");
require("dotenv").config();

// INDEX - show all tracked stocks
router.get("/", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid)
    .populate("trackedstocks")
    .exec((err, user) => {
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
      res.redirect("/stocks/" + req.params.userid);
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
      user.alerts.push({symbol: newStock.symbol, name: newStock.name});
      await user.save();
      req.flash("success", "Successfully added stock");
      res.redirect("/stocks/" + user._id);
    } else { // stock already in trackedstocks
      req.flash("error", "Stock already exists");
      res.redirect("/stocks/" + user._id);
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
      newstock = await createNewStock(queryBody, queryStock, true);
    }
    return newstock;
  } catch (err) {
    console.log(err);
  }
} 

const urlHead = "https://financialmodelingprep.com/api/v3/";
const apiKey = "?apikey=" + process.env.STOCK_API_KEY;
const timeSeriesCount = "&timeseries=30";
const timeSeries = "historical-price-full/";
const keyMetrics = "key-metrics/";
const rating = "rating/"
const profile = "profile/"
const financialGrowth = "financial-growth/"

/* 
  Create new stock 
    if flag is true: Create a new stock
    if flag is false: Update this stock
*/
async function createNewStock(queryBody, queryStock, flag) {
  try {
    const apiTimeSeriesUrl = urlHead + timeSeries + queryStock + apiKey + timeSeriesCount;
    const apikeyMetricsUrl = urlHead + keyMetrics + queryStock + apiKey;
    const apiProfileUrl = urlHead + profile + queryStock + apiKey;
    const apiRatingUrl = urlHead + rating + queryStock + apiKey;
    const apiFinancialGrowthUrl = urlHead + financialGrowth + queryStock + apiKey;

    // parse data to json
    async function getJSON(url) {
      var responsePromise = await got(url);
      return (JSON.parse(responsePromise.body));
    }

    // wait for all request to finish before processing data
    const results = await Promise.all([getJSON(apiTimeSeriesUrl), getJSON(apikeyMetricsUrl),
                                       getJSON(apiProfileUrl), getJSON(apiRatingUrl),
                                       getJSON(apiFinancialGrowthUrl)
                                      ]);

    let timeSeriesData = results[0]["historical"];  
    let keyMetricsData= results[1][0];
    let profileData = results[2][0];  
    let ratingData = results[3][0]; 
    let financialGrowthData = results[4][0];

    // check if stock just needs to be updated or needs to be created
    var newStock;
    if (flag) {
      newStock = await Stock.create(queryBody);
    } else {
      newStock = await Stock.findOne(queryBody);
      newStock.history = [];
    }

    // update stock history data
    timeSeriesData.forEach((aStock) => {
      let newHistoryEntry = 
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
    });

    // update profile data
    if ((profileData != null)) {
      let newProfileData = 
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
    }

    // update rating data
    if ((ratingData != null)) {
      let newRatingData = 
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
    }

    // update financial growth data
    if ((financialGrowthData != null)) {
      let newFinancialGrowthData = 
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
    }

    // update key metrics data
    if ((keyMetricsData != null)) {
      let newKeyMetricsData = 
        { 
          date : keyMetricsData["date"],
          marketcap :  formatNum(keyMetricsData["marketCap"]),
          netincome: formatNum(keyMetricsData["netIncomePerShare"]), //  "Net Income per Share"
          EV:  formatNum(keyMetricsData["enterpriseValue"]), // Enterprise Value
          netDebtToEBITDA:  formatNum(keyMetricsData["netDebtToEBITDA"]), // 0.695934725473018,
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
    }

    var foundSearchStock = await StockSearch.findOne({ symbol: queryStock});
    newStock.name = foundSearchStock.name.replace(/'/g, "%27");
    console.log(newStock.name);

    newStock.save();
    return newStock;

  } catch (err) {
    console.log(err);
  }
}

function formatNum(num) {
  if (num == null) {
    return "-";
  } else {
    if (num >= 1000) {
      return abbrNum(num, 2);
    }
    return num.toFixed(2);
  }
}

function abbrNum(number, decPlaces) {
  // 2 decimal places => 100, 3 => 1000, etc
  decPlaces = Math.pow(10,decPlaces);
  // Enumerate number abbreviations
  var abbrev = [ "k", "M", "B", "T" ];
  // Go through the array backwards, so we do the largest first
  for (var i=abbrev.length-1; i>=0; i--) {
      // Convert array index to "1000", "1000000", etc
      var size = Math.pow(10,(i+1)*3);
      // If the number is bigger or equal do the abbreviation
      if(size <= number) {
           // Here, we multiply by decPlaces, round, and then divide by decPlaces.
           // This gives us nice rounding to a particular decimal place.
           number = Math.round(number*decPlaces/size)/decPlaces;
           // Handle special case where we round up to the next abbreviation
           if((number == 1000) && (i < abbrev.length - 1)) {
               number = 1;
               i++;
           }
           // Add the letter for the abbreviation
           number += abbrev[i];
           break;
      }
  }
  return number;
}

// Update Stock db every 55 mins
async function updateDB() {
  var stocks = await Stock.find({});
  stocks.forEach( async (stock) => {
    var stock = await Stock.findOne({symbol: stock.symbol});
    const apiTimeSeriesUrl = "https://financialmodelingprep.com/api/v3/historical-price-full/"+ stock.symbol + "?timeseries=30&apikey=" + process.env.STOCK_API_KEY;
    createNewStock({symbol: stock.symbol}, stock.symbol, false);
  });
  console.log("just updated!");
}
// setInterval(updateDB, 1000 * 60 * 55);

module.exports = router;