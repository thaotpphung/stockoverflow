var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require('mongoose');
// var request = require("request"); // for API 

mongoose.connect('mongodb://localhost/stockapp', {useNewUrlParser: true, useUnifiedTopology: true});
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set ("view engine", "ejs");

// set up 
var trackedStockSchema = new mongoose.Schema({
    name: String
 });

var TrackedStock = mongoose.model("TrackedStock", trackedStockSchema);

app.get("/", function(req, res) {
    res.render("landing");
});

// INDEX - show all tracked stocks
app.get("/dashboard", function (req, res){
    // get all tracked stocks from DB
    TrackedStock.find({}, function(err, allTrackedStocks){
        if(err){
            console.log(err);
        } else {
            res.render("dashboard", {stocks: allTrackedStocks});
        }
    });
    
})

// CREATE - add new tracked stock to DB
app.post("/dashboard", function (req, res) {
    var name = req.body.name;
    var newStock = {name:name};
    // create new stock and save to DB
    TrackedStock.create(newStock, function(err, stock){
        if(err){
            console.log(err);
        } else {
            res.redirect("/dashboard");
        }
    });
})

// NEW - show form to create new tracked stock
app.get("/dashboard/new", function(req, res) {
    res.render("new");
})

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Stock App Server Has Started!");
});
