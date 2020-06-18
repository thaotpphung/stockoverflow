var mongoose = require("mongoose");

var StockSchema = new mongoose.Schema({
  symbol: String, // AAPL
  name: String, // APPLE
  time: [String],
  price: [Number], // open price
  change: [Number],
  changepercent: [Number],
});

module.exports = mongoose.model("Stock", StockSchema);
