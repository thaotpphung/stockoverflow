const stock = require("../models/stock");

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
  const queryStock = req.body.stock.symbol;
  const queryBody = req.body.stock;
  const api_url = "https://financialmodelingprep.com/api/v3/historical-price-full/"+ queryStock + "?timeseries=30&apikey=" + process.env.API_KEY;
  const dd = String((new Date()).getDate()).padStart(2, "0");

  var newStock = await checkSharedStockDB(queryStock, queryBody, dd, api_url);
  
  var user = await User.findById(req.params.userid).populate("trackedstocks");
    if (notInTrackedStocks(user.trackedstocks, queryStock)) { // if it's not in trackedstocks
      user.trackedstocks.push(newStock);
      user.save();
      req.flash("success", "Successfully added stock");
    } else { // stock already in trackedstocks
      req.flash("error", "Stock already exists");
    }
    res.redirect("/stocks/" + user._id);
});

/* 
check if stock is in shared db 
return foundstock if already exists
return newly created stock if not 
*/
async function checkSharedStockDB(queryStock, queryBody, dd, api_url){
  try{
    var newstock;
    var foundStock = await Stock.findOne({symbol: queryStock});
    if (foundStock && !(foundStock.lastupdated === dd)) {
      await Stock.deleteOne({symbol: queryStock});
      newstock = await processData(queryBody, queryStock, api_url, dd);
    } else if (!foundStock) {
      newstock = await processData(queryBody, queryStock, api_url, dd);
    } else {
      newstock = foundStock;
    }
    return newstock;
  } catch (err) {
    console.log(err);
  }
}

async function processData(queryBody, queryStock, api_url, dd) {
  try {
    var response = await got(api_url);
    let stockdata = JSON.parse(response.body)["historical"];
    var newStock = await Stock.create(queryBody);
    stockdata.forEach((aStock) => {
      newStock.time.push(aStock["label"]);
      newStock.price.push(Math.round(aStock["open"] * 100));
      newStock.change.push(aStock["change"]);
      newStock.changepercent.push(aStock["changePercent"]);
      newStock.lastupdated = dd;
    });
    var foundSearchStock = await StockSearch.findOne({ symbol: queryStock});
    newStock.name = foundSearchStock.name;
    newStock.save();
    return newStock;
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

// function updateDB() {
//   Stock.find({}, (err, stocks) =>  {
//     stocks.forEach(stock => {
//       Stock.findOneAndUpdate({ symbol: stock.symbol }, {$set: { time: ["July 1", "July 2", "July 3"] } }, {new: true}, (err, updatedStock) => {
//         console.log(updatedStock);
//       });
//     });
//   });
// }

// setInterval(updateDB, 5000);

module.exports = router;