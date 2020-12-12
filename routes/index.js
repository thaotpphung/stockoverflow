const express = require("express"),
  router = express.Router({ mergeParams: true }),
  StockSearch = require("../models/stocksearch"),
  StockMarket = require("../models/stockmarket")
  got = require("got"),
  Stock = require("../models/stock"),
  userController = require("../controller/user"),
  passport = require("passport"),
  middleware = require("../middleware");

require("dotenv").config();

// root route
router.get("/", async (req, res) => {
  const stockmarket = await StockMarket.findOne();
  res.render("landing", {stockmarket});
});

// get search route
router.post("/search", middleware.isLoggedIn, (req, res) => {
  StockSearch.find({ symbol: { $regex: req.body.symbol } }, (err, foundStock) => {
    if (foundStock.length > 0) {
      res.json({ foundStock });
    } else {
      res.json ({ foundStock: null });
    }
  });
});

// get price route
router.post("/getStock", (req, res) => {
  console.log("getStock", req.body.symbol);
  Stock.findOne({ symbol: req.body.symbol.toUpperCase() }, (err, foundStock) => {
    if (foundStock == null) {
      res.json ({ foundStock: null });
    } else {
      res.json({ foundStock });
    }
  });
});

router.get("*", function (req, res) {
  res.status(404).render("errorpage");
});

module.exports = router;
