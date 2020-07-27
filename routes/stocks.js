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

// EDIT ROUTE - edit a tracked stock
router.put("/:stockid", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, async (err, user) => {
    if (err) {
      console.log(err);
    } else {
      const index = user.trackedstocks.indexOf(req.params.stockid);
      addToTrackedStocks(user, (index != - 1), req.params.stockid, req, res);
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
        user.save();
      }
      req.flash("success", "Stock deleted");
      res.redirect("/stocks/" + req.params.userid);
    }
  });
});

// CREAT route - Add tracked stocks to the stocks db
router.post("/", middleware.checkCorrectUser, async (req, res) => {
  const queryStock = req.body.stock.symbol.toUpperCase();
  const queryBody = req.body.stock;
  // const apiTimeSeriesUrl = urlHead + timeSeries + queryStock + apiKey + timeSeriesCount;
  
  var user = await User.findById(req.params.userid).populate("trackedstocks");

  var newStock = await addToSharedStockDB(queryStock, queryBody);
  
  if ((queryBody.page === "transaction")) { // if the current page is the transaction page
    res.render("transactions/new", { stock: newStock, transaction: {totalquantity: 0} });
  } else { // the current page is the tracked stocks page
    addToTrackedStocks(user, checkStockExists(user.trackedstocks, queryStock), newStock._id, req, res);
  }
});

// add to tracked stocks if not already exists
async function addToTrackedStocks(user, checkStockExists, newStockId, req, res) {
  if (!checkStockExists) { // if it's not in trackedstocks
    user.trackedstocks.push(newStockId);
    await user.save();
    req.flash("success", "Successfully added stock");
    res.redirect("/stocks/" + user._id);
  } else { // stock already in trackedstocks
    req.flash("error", "Stock already exists");
    res.redirect("/stocks/" + user._id);
  }
}

// Checked if the query stock is in the tracked stock list by symbol
// return false if not exists in user's tracked stock
//        true if already exists in user's tracked stock
function checkStockExists(trackedstocks, queryStock){
  let counter = 0;
  trackedstocks.forEach((aStock) => {
    if (aStock.symbol == queryStock) {
      return;
    }
    counter++;
  });
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
const apiKey = "?apikey=" + process.env.API_KEY;
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
    let timeSeriesData = results[0]["historical"];  // ok
    let keyMetricsData= results[1][0];
    let profileData = results[2][0];  // ok
    let ratingData = results[3][0]; 
    let financialGrowthData = results[4][0];
    
    console.log("time", timeSeriesData);
    console.log("--------------------------------------");
    console.log("profile",profileData);
    console.log("--------------------------------------");
    console.log("finance", financialGrowthData);
    // console.log("finance type", typeof(financialGrowthData));
    console.log("--------------------------------------");
    console.log("rating", ratingData);
    // console.log("rate type", typeof(ratingData));
    console.log("--------------------------------------");
    console.log("key metrics", keyMetricsData);
    // console.log("key type", typeof(keyMetricsData));
    console.log("--------------------------------------");

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
          time: aStock["label"], 

          open: Math.round(aStock["open"] * 100), 
          high: aStock["high"],
          low: aStock["low"],
          close: aStock["close"],

          adjClose: aStock["adjClose"],
          volume: aStock["volume"],
          unadjustedVolume: aStock["unadjustedVolume"],

          change: aStock["change"], 
          changepercent: aStock["changePercent"],
        };
      newStock.history.push(newHistoryEntry);
    });

    if ((keyMetricsData != null)) {
      // update key metrics data
      let newKeyMetricsData = 
        { 
          date : keyMetricsData["date"],
          marketcap :  keyMetricsData["marketCap"],
          netincome: keyMetricsData["netIncomePerShare"], //  "Net Income per Share"
          EV:  keyMetricsData["enterpriseValue"], // Enterprise Value
          netDebtToEBITDA:  keyMetricsData["netDebtToEBITDA"], // 0.695934725473018,
          DE :  keyMetricsData["debtToEquity"], // Debt to Equity
          DY : keyMetricsData["dividendYield"], //  Dividend Yield
          payoutratio : keyMetricsData["payoutRatio"],
          rev: keyMetricsData["revenuePerShare"],  // "Revenue per Share"
          FCFS : keyMetricsData["freeCashFlowPerShare"], // Free Cash Flow per Share
          BVS : keyMetricsData["bookValuePerShare"], // "Book Value per Share"
          PEratio : keyMetricsData["peRatio"], // price to earning ratio,
          PSratio : keyMetricsData["priceToSalesRatio"], // "Price to Sales Ratio"
          PBratio : keyMetricsData["pbRatio"], // price to book
          currratio: keyMetricsData["currentRatio"], // current ratio
          PFCFratio : keyMetricsData["pfcfRatio"],  //  price-to-cash flow
          roe: keyMetricsData["roe"] // return on equity
        };
      newStock.keymetrics = newKeyMetricsData;
    }

    // update profile data
    if ((profileData != null)) {
      let newProfileData = 
        {
          beta: profileData["beta"],  // => stability
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

        ratingScores: [ratingData["ratingDetailsDCFScore"], ratingData["ratingDetailsROEScore"], ratingData["ratingDetailsDEScore"],
        ratingData["ratingDetailsPEScore"], ratingData["ratingDetailsPBScore"], ratingData["ratingScore"]],
        
        ratingRecommendation: [ratingData["ratingDetailsDCFRecommendation"], ratingData["ratingDetailsROERecommendation"], ratingData["ratingDetailsDERecommendation"],
        ratingData["ratingDetailsPERecommendation"], ratingData["ratingDetailsPBRecommendation"], ratingData["ratingRecommendation"],],

        ratingLabels: ["DCF", "ROE", "DE", "PE", "PB", "Overall"]
        // "DCF Score":ratingData["ratingDetailsDCFScore"],
        // "DCF Recommendation": ratingData["ratingDetailsDCFRecommendation"],
    
        // "ROE Score": ratingData["ratingDetailsROEScore"],
        // "ROE Recommendation": ratingData["ratingDetailsROERecommendation"],
    
        // "DE Score": ratingData["ratingDetailsDEScore"],
        // "DE Recommendation": ratingData["ratingDetailsDERecommendation"],
    
        // "PE Score": ratingData["ratingDetailsPEScore"],
        // "PE Recommendation": ratingData["ratingDetailsPERecommendation"],
    
        // "PB Score": ratingData["ratingDetailsPBScore"],
        // "PB Recommendation": ratingData["ratingDetailsPBRecommendation"]

        // "Overall Score": ratingData["ratingScore"],
        // "Recommendation": ratingData["ratingRecommendation"],

        // rating: ratingData["rating"],
        // ratingScore: ratingData["ratingScore"],
        // ratingRecommendation: ratingData["ratingRecommendation"],
        // ratingDetailsDCFScore: ratingData["ratingDetailsDCFScore"],
        // ratingDetailsDCFRecommendation: ratingData["ratingDetailsDCFRecommendation"],
        // ratingDetailsROEScore:ratingData["ratingDetailsROEScore"],
        // ratingDetailsROERecommendation: ratingData["ratingDetailsROERecommendation"],
        // ratingDetailsDEScore: ratingData["ratingDetailsDEScore"],
        // ratingDetailsDERecommendation: ratingData["ratingDetailsDERecommendation"],
        // ratingDetailsPEScore: ratingData["ratingDetailsPEScore"],
        // ratingDetailsPERecommendation: ratingData["ratingDetailsPERecommendation"],
        // ratingDetailsPBScore: ratingData["ratingDetailsPBScore"],
        // ratingDetailsPBRecommendation: ratingData["ratingDetailsPBRecommendation"]
      }
      newStock.rating = newRatingData;
    }

    // update financial growth data
    if ((financialGrowthData != null)) {
      let newFinancialGrowthData = 
        {
          date: financialGrowthData["date"], //"2019-09-28",
          revenueGrowth: financialGrowthData["revenueGrowth"],
          netIncomeGrowth: financialGrowthData["netIncomeGrowth"],
          dividendsperShareGrowth: financialGrowthData["dividendsperShareGrowth"],
          freeCashFlowGrowth: financialGrowthData["freeCashFlowGrowth"],
          grossProfitGrowth: financialGrowthData["grossProfitGrowth"],
          epsgrowth: financialGrowthData["epsgrowth"],
          debtGrowth: financialGrowthData["debtGrowth"],
          operatingCashFlowGrowth: financialGrowthData["operatingCashFlowGrowth"],
          operatingIncomeGrowth: financialGrowthData["operatingIncomeGrowth"],
          assetGrowth: financialGrowthData["assetGrowth"],
        }
      newStock.financialgrowth = newFinancialGrowthData;
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

// Update Stock db every 55 mins
async function updateDB() {
  var stocks = await Stock.find({});
  stocks.forEach( async (stock) => {
    var stock = await Stock.findOne({symbol: stock.symbol});
    const apiTimeSeriesUrl = "https://financialmodelingprep.com/api/v3/historical-price-full/"+ stock.symbol + "?timeseries=30&apikey=" + process.env.API_KEY;
    createNewStock({symbol: stock.symbol}, stock.symbol, false);
  });
  console.log("just updated!");
}
// setInterval(updateDB, 1000 * 60 * 55);

module.exports = router;