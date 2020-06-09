var express = require("express");
var router  = express.Router({mergeParams: true});
var User = require("../models/user");
var Purchase = require("../models/purchase");
var Stock = require("../models/stock");

// show purchase

// New purchase - form to add purchase
router.get("/new", isLoggedIn, function(req, res){
    User.findById(req.params.userid, function(err, user ){
        if(err){
            console.log(err);
        } else {
            Stock.findById(req.params.stockid, function(err, stock){
                if(err){
                    console.log(err);
                } else {
                    res.render("purchases/new", {user: user, stock: stock});
                }
            });
        }
    })
});

//  creat - add purchase to db
router.post("/",isLoggedIn,function(req, res){
   User.findById(req.params.userid, function(err, user){
       if(err){
           console.log(err);
           res.redirect("/dashboard");
       } else {
            Purchase.create(req.body.purchase, function(err, purchase){
            if(err){
                console.log(err);
            } else { 
                purchase.user.id = req.user._id;
                purchase.user.username = req.user.username;
                //save purchase
                purchase.save();
                user.purchases.push(purchase);
                user.save();
                res.redirect('/dashboard/' + user._id);
            }
        });
       }
   });
});

//middleware
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;