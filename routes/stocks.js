const express = require("express"),
    router  = express.Router({mergeParams: true}),
    Stock = require("../models/stock"),
    User = require("../models/user"),
    middleware = require("../middleware"),
    got = require('got');

require("dotenv").config();

// INDEX - show all tracked stocks
router.get("/", middleware.checkCorrectUser, (req, res) => {
    User.findById(req.params.userid).populate("trackedstocks").exec((err, user) => {
        if (err){
            console.log(err);
            res.redirect("/");
        } else {
            // get data from the table
            res.render("stocks/index", {stocks: user.trackedstocks});
        }
    });
});

// add tracked stocks to the stocks db
router.post("/", middleware.checkCorrectUser, (req, res) => {
    // find user and populate trackedstocks field
    User.findById(req.params.userid).populate("trackedstocks").exec((err, user) => {
        if(err){
            console.log(err);
            res.redirect("/");
        } else {
            // check if the stock is in SHARED stock db 
            Stock.find({symbol: req.body.stock.symbol}, (err, foundStock) =>
            {   
                const queryStock = req.body.stock.symbol;
                const api_url = "https://financialmodelingprep.com/api/v3/historical-price-full/" + queryStock + "?timeseries=30&apikey=" + process.env.API_KEY;
                if (foundStock.length) {  // means that the query returns some stocks of the same name => already exists in SHARED stocks db
                    // check if the stock price is up to date 
                    console.log(foundStock[0].time[0].split(" ")[1].substring(0,2));
                    let stockday = foundStock[0].time[0].split(" ")[1].substring(0,2);
                    var today = new Date();
                    let dd = String(today.getDate()).padStart(2, '0');
                    // eval(require("locus"));

                    if (!(stockday === dd)) { // means that the newest date is not up to date
                        // make api call to update the price,time
                        addToStock();
                        async function fetchData()  {
                            try {
                                const response = await got(api_url);
                                let stockdata = JSON.parse(response.body)["historical"];
                                stockdata.forEach((aStock) => {
                                    foundStock[0].time.push(aStock["label"]);
                                    foundStock[0].price.push(aStock["open"]);
                                    foundStock[0].change.push(aStock["change"]);
                                    foundStock[0].changepercent.push(aStock["changePercent"]);
                                });
                                foundStock[0].save();
                            } catch (error) {
                                console.log(error);
                            }
                        };
                        async function addToStock() {
                            try {
                                await fetchData();
                            } catch (error) {
                                console.log('error', error);
                            }
                        }
                    }
                    // done update SHARED stocks if needed

                    // check if exists in trackedstocks for user, if not add it
                    let counter = 0;
                    user.trackedstocks.forEach((aStock) => {
                        if (aStock.symbol == foundStock[0].symbol) {
                            return;
                        }
                        counter++;
                    });
                    // checked all tracked stock array, can't find it then push it to the trackedstock
                    if (counter == user.trackedstocks.length){
                        user.trackedstocks.push(foundStock[0]);
                        user.save();
                        req.flash("success", "Successfully added stock");
                    } else {
                        req.flash("error", "Stock already exists");
                    }
                    res.redirect('/stocks/' + user._id);
                } else { // not exists in the SHARED stock db, make API call and add to stock db and trackedstock array of the user
                    addToStock2();
                    async function fetchData2()  {
                        try {
                            const response = await got(api_url);
                            let stockdata = JSON.parse(response.body)["historical"];
                            Stock.create(req.body.stock, (err, newStock) => {
                                if(err){
                                    console.log(err);
                                } else {
                                    stockdata.forEach((aStock) => {
                                        newStock.time.push(aStock["label"]);
                                        newStock.price.push(aStock["open"]);
                                        newStock.change.push(aStock["change"]);
                                        newStock.changepercent.push(aStock["changePercent"]);
                                    });
                                    // stock.name = JSON.parse(response.body)["symbol"];
                                    newStock.save();
                                    user.trackedstocks.push(newStock);
                                    user.save();
                                    req.flash("success", "Successfully added stock");
                                    res.redirect('/stocks/' + user._id);
                                }
                             });
                        } catch (error) {
                            console.log(error);
                        }
                    };
                    async function addToStock2() {
                        try {
                            await fetchData2();
                        } catch (error) {
                            console.log('error', error);
                        }
                    }
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