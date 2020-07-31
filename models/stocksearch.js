var mongoose = require("mongoose");

var StockSearchSchema = new mongoose.Schema(
  {
    symbol: String,
    name: String,
  },
  {
    collection: "search",
  }
);

module.exports = mongoose.model("StockSearch", StockSearchSchema);
