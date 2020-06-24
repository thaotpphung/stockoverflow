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
  const api_url = "https://financialmodelingprep.com/api/v3/historical-price-full/" 
    + queryStock +
    "?timeseries=30&apikey=" +
    process.env.API_KEY;
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  checkUpdate(queryStock, queryBody, dd, api_url).then( newStock => {
    User.findById(req.params.userid).populate("trackedstocks").exec((err, user) => {
      console.log("find user here");
      console.log("not in tracked", notInTrackedStocks(user.trackedstocks, queryStock));
      console.log('newstock in main', newStock);
      if (notInTrackedStocks(user.trackedstocks, queryStock)) { // if it's not in trackedstocks
        user.trackedstocks.push(newStock.newStock);
        user.save();
        req.flash("success", "Successfully added stock");
      } else {
        req.flash("error", "Stock already exists");
      }
      res.redirect("/stocks/" + user._id);
    });
  })
});

function checkUpdate(queryStock, queryBody, dd, api_url){
  return new Promise((resolve, reject) => {
    var result;
    Stock.findOne({symbol: queryStock}, (err, foundStock)  => {
      if (foundStock && !(foundStock.lastupdated === dd)) {
        console.log("not up to date");
        Stock.deleteOne({symbol: queryStock}, () => {
          console.log("deleted old data")
          processData(queryBody, queryStock, api_url, dd).then(aNewStock => {
            console.log('after process data', aNewStock);
            result = aNewStock;
            resolve(result);
          }) ;
        });
      } else if (!foundStock) {
        processData(queryBody, queryStock, api_url, dd).then(aNewStock => {
          console.log('after process data',aNewStock);
          result = aNewStock;
          resolve(result);
        }) ;
      } else {
        console.log("not changed")
        result = foundStock;
        resolve(result);
      }
    });
  });
}

async function fetchData(api_url) {
  try {
    return await got(api_url);
  } catch (error) {
    console.log(error);
  }
}

async function processData(queryBody, queryStock, api_url, dd) {
  try {
    var response = await fetchData(api_url);
    return new Promise((resolve, reject) => {
      let stockdata = JSON.parse(response.body)["historical"];
      Stock.create(queryBody, (err, newStock) => {
        if (err) {
          console.log(err);
        } else {
          stockdata.forEach((aStock) => {
            newStock.time.push(aStock["label"]);
            newStock.price.push(Math.round(aStock["open"] * 100));
            newStock.change.push(aStock["change"]);
            newStock.changepercent.push(aStock["changePercent"]);
            newStock.lastupdated = dd;
          });
          StockSearch.findOne({ symbol: queryStock}, (err, foundSearchStock)  => {
            newStock.name = foundSearchStock.name;
            newStock.save();
            resolve({newStock});
          });
        }
      });
    })
  } catch (error) {
    console.log("error in process data", error);
  }
}

function notInTrackedStocks(trackedstocks, queryStock){
  let counter = 0;
  trackedstocks.forEach((aStock) => {
    if (aStock.symbol == queryStock) {
      return;
    }
    counter++;
  });
  // checked all tracked stock array, can't find it => not exist in trackedStocks
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

module.exports = router;