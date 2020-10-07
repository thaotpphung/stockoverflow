var mongoose = require("mongoose");

var StockMarketSchema = new mongoose.Schema(
  {
    mostactive: [
      {
        symbol: String,
        changesPercentage: Number,
        price: String
      }
    ],
    mostloser: [
      {
        symbol: String,
        changesPercentage: Number,
        price: Number
      }
    ],
    mostgainer: [
      {
        symbol: String,
        changesPercentage: Number,
        price: Number
      }
    ],
  }
);

module.exports = mongoose.model("StockMarket", StockMarketSchema);
