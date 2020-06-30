var mongoose = require("mongoose");

var StockNyseSchema = new mongoose.Schema(
  {
    symbol: String,
    name: String,
    type: String,
    tracked: Boolean
  },
  {
    collection: "stockNyse",
  }
);

module.exports = mongoose.model("StockNyse", StockNyseSchema);
