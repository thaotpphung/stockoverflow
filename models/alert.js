var mongoose = require("mongoose");

var alertSchema = mongoose.Schema({
  userid: String,
  stockid: String,
  symbol: String,
  name: String,
  alertPrice: Number,
  currentPrice: Number
});

module.exports = mongoose.model("Alert", alertSchema);




