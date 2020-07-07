const stock = require("../models/stock");
const { query } = require("express");

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
        // get data from the table
        res.render("stocks/index", { stocks: user.trackedstocks });
      }
    });
});

// add tracked stocks to the stocks db
router.post("/", middleware.checkCorrectUser, async (req, res) => {
  const queryStock = req.body.stock.symbol.toUpperCase();
  // const foundStockName = await StockSearch.findOne({symbol: queryStock});
  // if (foundStockName) {
  const queryBody = req.body.stock;
  const api_url = "https://financialmodelingprep.com/api/v3/historical-price-full/"+ queryStock + "?timeseries=30&apikey=" + process.env.API_KEY;
  const dd = String((new Date()).getDate()).padStart(2, "0");

  // return the stock in db, create new one if neccessary
  var newStock = await checkSharedStockDB(queryStock, queryBody, dd, api_url);

  var user = await User.findById(req.params.userid).populate("trackedstocks");
  
  if (notInTrackedStocks(user.trackedstocks, queryStock)) { // if it's not in trackedstocks
    user.trackedstocks.push(newStock);
    await user.save();
    req.flash("success", "Successfully added stock");
  } else { // stock already in trackedstocks
    req.flash("error", "Stock already exists");
  }
  // } else {
  //   req.flash("error", "Can't find stock, please try another one");
  // }
  res.redirect("/stocks/" + req.params.userid);
});

/* 
check if stock is in shared db 
return foundstock if already exists
return newly created stock if not 
*/
async function checkSharedStockDB(queryStock, queryBody, dd, api_url){
  try{
    var newstock;
    const foundStock = await Stock.findOne({symbol: queryStock});
    if (foundStock) { // if found the stock, return it
      newstock = foundStock;
    } else { // if not, create the stock
      newstock = await createNewStock(queryBody, queryStock, api_url, dd, true);
    }
    return newstock;
  } catch (err) {
    console.log(err);
  }
}

// checked all tracked stock array, can't find it => not exist in trackedStocks
function notInTrackedStocks(trackedstocks, queryStock){
  let counter = 0;
  trackedstocks.forEach((aStock) => {
    if (aStock.symbol == queryStock) {
      return;
    }
    counter++;
  });
  return (counter === trackedstocks.length) ? true : false;
}

// NEW - show form to create new tracked stock
router.get("/new", middleware.checkCorrectUser, (req, res) => {
  let searchTerm = "";
  res.render("stocks/new", { searchTerm: searchTerm });
});

// show information of the chosen stock
router.get("/:stockid", middleware.checkCorrectUser, (req, res) => {
  Stock.findById(req.params.stockid, (err, foundStock) => {
    if (err || !foundStock) {
      req.flash("error", "Stock not found");
      res.redirect("back");
    } else {
      //render show template with that stock
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
        user.save();
      }
      req.flash("success", "Stock deleted");
      res.redirect("/stocks/" + req.params.userid);
    }
  });
});

async function updateDB() {
  var stocks = await Stock.find({});
  stocks.forEach( async (stock) => {
    var stock = await Stock.findOne({symbol: stock.symbol});
    const api_url = "https://financialmodelingprep.com/api/v3/historical-price-full/"+ stock.symbol + "?timeseries=30&apikey=" + process.env.API_KEY;
    const dd = String((new Date()).getDate()).padStart(2, "0");
    createNewStock({symbol: stock.symbol}, stock.symbol, api_url, dd, false);
  });
  console.log("just updated!");
}

// update daily every 1 hour
setInterval(updateDB, 1000 * 60 * 55);
// setInterval(updateDB, 1000 );

async function createNewStock(queryBody, queryStock, api_url, dd, flag) {
  try {
    var response = await got(api_url);
    let stockdata = JSON.parse(response.body)["historical"];
    var newStock;
    if (flag) {
      newStock = await Stock.create(queryBody);
    } else {
      newStock = await Stock.findOne(queryBody);
      newStock.time = [];
      newStock.price = [];
      newStock.change = [];
      newStock.changepercent = [];
    }
    stockdata.forEach((aStock) => {
      newStock.time.push(aStock["label"]);
      newStock.price.push(Math.round(aStock["open"] * 100));
      newStock.change.push(aStock["change"]);
      newStock.changepercent.push(aStock["changePercent"]);
      newStock.lastupdated = dd;
    });
    var foundSearchStock = await StockSearch.findOne({ symbol: queryStock});
    newStock.name = foundSearchStock.name.replace(/'/g, '`');
    newStock.save();
    return newStock;
  } catch (err) {
    console.log(err);
  }
}

module.exports = router;