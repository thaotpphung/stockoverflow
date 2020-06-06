var express      = require("express"),
    app          = express(),
    bodyParser   = require("body-parser"),
    mongoose     = require('mongoose'),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    Stock = require("./models/stock"),
    User        = require("./models/user"),
    seedDB      = require("./seeds");
// var request = require("request"); // for API 

mongoose.connect('mongodb://127.0.0.1/stockapp', {useNewUrlParser: true, useUnifiedTopology: true});
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set ("view engine", "ejs");
// seedDB();
 

// Stock.create(
//     {
//         name: "AMZ",
//         description:"AMAZON"
//     }, 
//     function(err, stock){
//     if(err){
//         console.log(err);
//     } else {
//         console.log("CREATED NEW STOCK");
//     }
// });

app.get("/", function(req, res) {
    res.render("landing");
});

// INDEX - show all tracked stocks
app.get("/dashboard", function (req, res){
    // get all tracked stocks from DB
    Stock.find({}, function(err, allStocks){
        if(err){
            console.log(err);
        } else {
            res.render("dashboard", {stocks: allStocks});
        }
    });
    
})

// CREATE - add new tracked stock to DB
app.post("/dashboard", function (req, res) {
    var name = req.body.name;
    var description = req.body.description;
    var newStock = {name:name, description:description};
    // create new stock and save to DB
    Stock.create(newStock, function(err, stock){
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

app.get("/dashboard/:id", function(req, res) {
    Stock.findById(req.params.id, function(err, foundStock){
        if(err){
            console.log(err);
        } else {
            //render show template with that campground
            res.render("show", {stock: foundStock});
        }
    });
})

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Stock App Server Has Started!");
});
