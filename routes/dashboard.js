var express = require("express");
var router  = express.Router({mergeParams: true});
var Stock = require("../models/stock");
var User = require("../models/user");

// INDEX - show all tracked stocks
router.get("/", function (req, res){
    // get all tracked stocks from DB
    User.findById(req.params.userid, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/");
        } else {
            // var allStocks = [];
            // user.trackedstocks.forEach(function(stock)
            // {
            //     Stock.find({name:stock}, function(err, foundStock){
            //         allStocks.push(foundStock);
            //         console.log("all stocks in loop", allStocks);
            //     });
            // });
            // console.log("all stocks here", allStocks);
            res.render("dashboard/index", {stocks: user.trackedstocks});
        }
    });
});

router.post("/",isLoggedIn,function(req, res){
    User.findById(req.params.userid, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/");
        } else {
         Stock.create(req.body.stock, function(err, stock){
            if(err){
                console.log(err);
            } else {
                //add username and id to comment
                user.trackedstocks.push(stock.name);
                user.save();
                console.log(stock);
                res.redirect('/dashboard/' + user._id);
            }
         });
        }
    });
 });

// NEW - show form to create new tracked stock
router.get("/new", isLoggedIn, function(req, res) {
    res.render("dashboard/new");
})

// show information of the chosen stock
router.get("/:stockid", function(req, res) {
    Stock.findById(req.params.stockid, function(err, foundStock){
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