const express = require("express"),
    router  = express.Router({mergeParams: true}),
    User = require("../models/user"),
    Purchase = require("../models/purchase"),
    Stock = require("../models/stock"),
    middleware = require("../middleware");

// New purchase - form to add purchase
router.get("/new", middleware.checkCorrectUser, (req, res) => {
    User.findById(req.params.userid, (err, user) =>{
        if(err || !user){
            req.flash("error", "User not found");
            res.redirect("back"); 
        } else {
            Stock.findById(req.params.stockid, (err, stock) => {
                if(err || !stock){
                    req.flash("error", "Stock not found");
                    res.redirect("back"); 
                } else {
                    res.render("purchases/new", {user: user, stock: stock});
                }
            });
        }
    })
});

//  creat - add purchase to db
router.post("/", middleware.checkCorrectUser, (req, res) => {
   User.findById(req.params.userid, (err, user) => {
       if(err || !user){
            req.flash("error", "User not found");
            res.redirect("back"); 
       } else {
            Purchase.create(req.body.purchase, (err, purchase) => {
            if(err){
                console.log(err);
            } else { 
                Stock.findById(req.params.stockid, (err, stock) => {
                    if(err){
                        console.log(err);
                    } else { 
                        purchase.name = stock.name;
                        purchase.price = stock.price;
                        purchase.user.id = req.user._id;
                        purchase.user.username = req.user.username;
                        purchase.save();
                        user.purchases.push(purchase);
                        user.save();
                        req.flash("success", "Successfully purchased stock");
                        res.redirect('/portfolio/' + user._id);
                    }
                });
            }
        });
       }
   });
});

module.exports = router;