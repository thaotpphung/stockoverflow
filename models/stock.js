var mongoose = require("mongoose");

var StockSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: String
 });

module.exports = mongoose.model("Stock", StockSchema);


// symbol: String, // AAPL
// name: String,  // APPLE
// time:[String],
// price: [Number], // open price
// change: [Number],
// changepercent: [Number]
