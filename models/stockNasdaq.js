var mongoose = require("mongoose");

var StockNasdaqSchema = new mongoose.Schema(
  {
    symbol: String,
    name: String,
    type: String,
    tracked: Boolean
  },
  {
    collection: "stockNasdaq",
  }
);

module.exports = mongoose.model("StockNasdaq", StockNasdaqSchema);
