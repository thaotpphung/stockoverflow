var mongoose = require("mongoose");

var StockSchema = new mongoose.Schema({
    name: String,
    description: String
 });

module.exports = mongoose.model("Stock", StockSchema);

