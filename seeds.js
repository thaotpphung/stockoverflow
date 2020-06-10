var mongoose = require("mongoose");
var Stock = require("./models/stock");
// var Comment   = require("./models/comment");

var data = [
    {
        name: "AMZ", 
        description: "blah blah blah",
        price: "12"
    },
    {
        name: "APL", 
        description: "blah blah blah 2",
        price: "15"
    },
    {
        name: "HULU", 
        description: "hululuf",
        price: "20"
    }
]

function seedDB(){
    //Remove all stocks
    Stock.remove({}, function(err){
         if(err){
             console.log(err);
         }
         console.log("removed stocks!");
          //add a few stocks
         data.forEach(function(seed){
             Stock.create(seed, function(err, stock){
                 if(err){
                     console.log(err)
                 } else {
                     console.log("added a stock");
                 }
             });
         });
     }); 
 }
 
 module.exports = seedDB;
