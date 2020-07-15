var mongoose = require("mongoose");

var StockSchema = new mongoose.Schema({
  symbol: String, // AAPL
  name: String, // APPLE
  history: [
    {
      time: String,
      price: Number,
      change: Number,
      changepercent: Number
    }
  ]
});

module.exports = mongoose.model("Stock", StockSchema);
