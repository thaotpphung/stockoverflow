var mongoose = require("mongoose");

var StockSchema = new mongoose.Schema({
  symbol: String, 
  name: String, 
  history: [
    {
      date: String,
      label: String,
      open: Number,
      high: Number,
      low: Number,
      close: Number,
      vwap: String,
      adjClose: String,
      volume: String,
      unadjustedVolume: String,
      change: Number,
      changepercent: Number
    }
  ],
  profile: {
    beta: String,  
    exchange: String,  
    industry: String, 
    website: String,
    description: String, 
    ceo: String, 
    sector: String,
    image: String, 
  },
  keymetrics: {
    date : String,
    marketcap : String,
    netincome: String,  
    EV: String, 
    netDebtToEBITDA: String, 
    DE : String, 
    DY : String, 
    payoutratio : String,
    rev: String,  
    FCFS : String, 
    BVS : String, 
    PEratio : String,  
    PSratio : String, 
    PBratio : String, 
    currratio: String, 
    PFCFratio : String,  
    roe: String,
  },
  financialgrowth: {
    date: String, 
    revenueGrowth: String, 
    netIncomeGrowth: String, 
    dividendsperShareGrowth: String, 
    freeCashFlowGrowth: String, 
    grossProfitGrowth: String, 
    epsgrowth: String, 
    debtGrowth: String, 
    operatingCashFlowGrowth: String, 
    operatingIncomeGrowth: String, 
    assetGrowth: String,
  },
  rating: {
    date: String,  
    "Overall Rating": String, 
    ratingScores: [
      {
        type: Number
      }
    ],
    ratingRecommendation: [
      {
        type: String
      }
    ],
    ratingLabels: [
      {
        type: String 
      }
    ],
    ratingLabelsFull: [
      {
        type: String 
      }
    ],
  }
});

module.exports = mongoose.model("Stock", StockSchema);
