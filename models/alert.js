var mongoose = require("mongoose");

var alertSchema = mongoose.Schema({
  userid: String,
  symbol: String,
  name: String,
  alertPrice: Number,
  currentPrice: Number,
  stockid: String
});

module.exports = mongoose.model("Alert", alertSchema);




