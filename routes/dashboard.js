var express = require("express");
var router  = express.Router();
var Stock = require("../models/stock");

// INDEX - show all tracked stocks
router.get("/", function (req, res){
    // get all tracked stocks from DB 
    console.log(req.user);
    Stock.find({}, function(err, allStocks){
        if(err){
            console.log(err);
        } else {
            res.render("dashboard/index", {stocks: allStocks});
        }
    });
})

// CREATE - add new tracked stock to DB
router.post("/", isLoggedIn, function (req, res) {
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
router.get("/new", isLoggedIn, function(req, res) {
    res.render("dashboard/new");
})

router.get("/:id", function(req, res) {
    Stock.findById(req.params.id, function(err, foundStock){
        if(err){
            console.log(err);
        } else {
            //render show template with that stock
            res.render("dashboard/show", {stock: foundStock});
        }
    });
})

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;