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

// Add tracked stocks to the stocks db
router.post("/", middleware.checkCorrectUser, async (req, res) => {
  const queryStock = req.body.stock.symbol.toUpperCase();
  const queryBody = req.body.stock;
  const api_url = "https://financialmodelingprep.com/api/v3/historical-price-full/"+ queryStock + "?timeseries=30&apikey=" + process.env.API_KEY;
  var user = await User.findById(req.params.userid).populate("trackedstocks");
  var newStock = await checkSharedStockDB(queryStock, queryBody, api_url);
  if ((queryBody.page === "purchase")) { // if the current page is the purchase page
    res.render("purchases/new", { stock: newStock });
  } else { // the current page is the tracked stocks page
    addToTrackedStocks(user, req.params.userid, notInTrackedStocks(user.trackedstocks, queryStock), newStock._id, req, res);
  }
});

/* 
  Check if stock is in shared db 
    return foundstock if already exists
    return newly created stock if not 
*/
async function checkSharedStockDB(queryStock, queryBody, api_url){
  try{
    var newstock;
    const foundStock = await Stock.findOne({symbol: queryStock});
    if (foundStock) { // if found the stock, return it
      newstock = foundStock;
    } else { // if not, create the stock
      newstock = await createNewStock(queryBody, queryStock, api_url, true);
    }
    return newstock;
  } catch (err) {
    console.log(err);
  }
} 

// Checked if the query stock is in the tracked stock list by symbol
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

/* 
  Create new stock 
    if flag is true: Create a new stock
    if flag is false: Update this stock
*/
async function createNewStock(queryBody, queryStock, api_url, flag) {
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
    });
    var foundSearchStock = await StockSearch.findOne({ symbol: queryStock});
    newStock.name = foundSearchStock.name.replace(/'/g, '`');
    newStock.save();
    return newStock;
  } catch (err) {
    console.log(err);
  }
}

// SHOW ROUTE - show information of the chosen stock
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

// EDIT ROUTE - edit a tracked stock
router.put("/:stockid", middleware.checkCorrectUser, (req, res) => {
  User.findById(req.params.userid, async (err, user) => {
    if (err) {
      console.log(err);
    } else {
      const index = user.trackedstocks.indexOf(req.params.stockid);
      addToTrackedStocks(user, req.params.userid, (index == - 1), req.params.stockid, req, res);
    }
  });
});

async function addToTrackedStocks(user, userid, notInTrackedStocks, newStockId, req, res) {
  if (notInTrackedStocks) { // if it's not in trackedstocks
    user.trackedstocks.push(newStockId);
    await user.save();
    req.flash("success", "Successfully added stock");
  } else { // stock already in trackedstocks
    req.flash("error", "Stock already exists");
  }
  res.redirect("/stocks/" + userid);
}

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

// Update Stock db every 55 mins
async function updateDB() {
  var stocks = await Stock.find({});
  stocks.forEach( async (stock) => {
    var stock = await Stock.findOne({symbol: stock.symbol});
    const api_url = "https://financialmodelingprep.com/api/v3/historical-price-full/"+ stock.symbol + "?timeseries=30&apikey=" + process.env.API_KEY;
    createNewStock({symbol: stock.symbol}, stock.symbol, api_url, false);
  });
  console.log("just updated!");
}
setInterval(updateDB, 1000 * 60 * 55);


module.exports = router;