var mongoose = require("mongoose");

var StockSearchSchema = new mongoose.Schema(
  {
    symbol: String,
    name: String,
  },
  {
    collection: "stocksearch",
  }
);

module.exports = mongoose.model("StockSearch", StockSearchSchema);
