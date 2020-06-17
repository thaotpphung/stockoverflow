const express = require("express"),
    router  = express.Router({mergeParams: true}),
    Stock = require("../models/stock"),
    User = require("../models/user"),
    middleware = require("../middleware"),
    got = require('got');
require("dotenv").config();

// INDEX - show all tracked stocks
router.get("/", middleware.checkCorrectUser, (req, res) => {
    // console.log(process.env.API_KEY);
    User.findById(req.params.userid).populate("trackedstocks").exec((err, foundUser) => {
        if (err){
            console.log(err);
            res.redirect("/");
        } else {
            var datapoints = [];
            const api_url = "https://financialmodelingprep.com/api/v3/historical-price-full/AAPL?timeseries=30&apikey=demo";
            chartIt();
            async function fetchData()  {
                try {
                    const response = await got(api_url);
                    let stockdata = JSON.parse(response.body)["historical"];
                    stockdata.forEach((stock) => {
                        datapoints.push({
                            label: stock["label"],
                            y: parseFloat(stock["open"])
                        });
                    });
                    return datapoints;
                } catch (error) {
                    console.log(error);
                }
            };
            async function chartIt() {
                try {
                    datapoints =  await fetchData();
                    res.render("stocks/index", {stocks: foundUser.trackedstocks, datapoints: datapoints});
                } catch (error) {
                    console.log('error', error);
                }
            }
        }
    });
});

// add tracked stocks to the shared stocks db
router.post("/", middleware.checkCorrectUser, (req, res) => {
    User.findById(req.params.userid).populate("trackedstocks").exec((err, user) => {
        if(err){
            console.log(err);
            res.redirect("/");
        } else {
            Stock.find({name: req.body.stock.name}, (err, stock) =>
            {   
                if (stock.length) {  // already exists in stocks db
                    // check if exists in trackedstocks for user, if not add it
                    let counter = 0;
                    user.trackedstocks.forEach((aStock) => {
                        if (aStock.name == stock[0].name) {
                            return;
                        }
                        counter++;
                    });
                    if (counter == user.trackedstocks.length){
                        user.trackedstocks.push(stock[0]);
                        user.save();
                        req.flash("success", "Successfully added stock");
                    } else {
                        req.flash("error", "Stock already exists");
                    }
                    res.redirect('/stocks/' + user._id);
                } else { // not exists, add to stock db and trackedstock db
                    Stock.create(req.body.stock, (err, stock) => {
                        if(err){
                            console.log(err);
                        } else {
                            user.trackedstocks.push(stock);
                            user.save();
                            req.flash("success", "Successfully added stock");
                            res.redirect('/stocks/' + user._id);
                        }
                     });
                }
            });
        }
    });
 });

// NEW - show form to create new tracked stock
router.get("/new", middleware.checkCorrectUser, (req, res) => {
    res.render("stocks/new");
})

// show information of the chosen stock
router.get("/:stockid", middleware.checkCorrectUser, (req, res) => {
    Stock.findById(req.params.stockid, (err, foundStock) => {
        if(err || !foundStock){
            req.flash("error", "Stock not found");
            res.redirect("back");
        } else {
            //render show template with that stock
            res.render("stocks/show", {stock: foundStock});
        }
    });
})

// DESTROY ROUTE - delete a tracked stock
router.delete("/:stockid", middleware.checkCorrectUser, (req, res) => {
    User.findById(req.params.userid, (err, user) => {
        if(err){
            console.log(err);
        } else {
            const index = user.trackedstocks.indexOf(req.params.stockid);
            if (index > -1) {
                user.trackedstocks.splice(index, 1);
                user.save();
            }
            req.flash("success", "Stock deleted");
            res.redirect("/stocks/" + req.params.userid);
        }
    });
});

module.exports = router;