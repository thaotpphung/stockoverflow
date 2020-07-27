var mongoose = require("mongoose");

var StockSchema = new mongoose.Schema({
  symbol: String, 
  name: String, 
  history: [
    {
      time: String,
      open: Number,
      high: Number,
      low: Number,
      close: Number,

      adjClose: Number,
      volume: Number,
      unadjustedVolume: Number,

      change: Number,
      changepercent: Number
    }
  ],
  profile: {
    beta: Number,  // => stability
    exchange: String,  // "NASDAQ"
    industry: String, //"Consumer Electronics",
    website: String, // "http://www.apple.com",
    description: String, //"Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. It also sells various related services. The company offers iPhone, a line of smartphones; Mac, a line of personal computers; iPad, a line of multi-purpose tablets; and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, HomePod, iPod touch, and other Apple-branded and third-party accessories. It also provides digital content stores and streaming services; AppleCare support services; and iCloud, a cloud service, which stores music, photos, contacts, calendars, mail, documents, and others. In addition, the company offers various service, such as Apple Arcade, a game subscription service; Apple Card, a co-branded credit card; Apple News+, a subscription news and magazine service; and Apple Pay, a cashless payment service, as well as licenses its intellectual property, and provides other related services. The company serves co",
    ceo: String, // "Mr. Timothy D. Cook",
    sector: String, //"Technology",
    image: String, // "https://financialmodelingprep.com/image-stock/AAPL.jpg"
  },
  keymetrics: {
    date : String,
    marketcap : Number,
    netincome: Number,  //  "Net Income per Share"
    EV: Number, // Enterprise Value
    netDebtToEBITDA: Number, // 0.695934725473018,
    DE : Number, // Debt to Equity
    // dividend
    DY : Number, //  Dividend Yield
    payoutratio : Number,
    // valuation
    rev: Number,  // "Revenue per Share"
    FCFS : Number, // Free Cash Flow per Share
    BVS : Number, // "Book Value per Share"
    // ratio
    PEratio : Number,  // price to earning ratio,
    PSratio : Number, // "Price to Sales Ratio"
    PBratio : Number, // price to book
    currratio: Number, // current ratio
    PFCFratio : Number,  //  price-to-cash flow
    roe: Number, // return on equity
  },
  financialgrowth: {
    date: String, //"2019-09-28",
    revenueGrowth: Number, //-0.020410775805267418,
    netIncomeGrowth: Number, //-0.07181132519191681,
    dividendsperShareGrowth: Number, // 0.10494717879684691,
    freeCashFlowGrowth: Number, //-0.08148656446406013,
    grossProfitGrowth: Number, //-0.03384754367187423,
    epsgrowth: Number, //-0.003330557868442893,  // earning per share
    debtGrowth: Number, // -0.004408938830850867,
    operatingCashFlowGrowth: Number, // -0.10386910142831314,
    operatingIncomeGrowth: Number, // -0.09828203898558492,
    assetGrowth: Number, // -0.07439742976279992,
  },
  rating: {
    date: String,  //"2020-07-17",

    "Overall Rating": String, //"S-",
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

    // dcf, roe, de, pe, pb, overall
    // "Overall Score": Number, //5,
    // "Recommendation": String, // "Strong Buy",

    // "DCF Score": Number, // 5, // Discounted cash flow
    // "DCF Recommendation": String, // "Strong Buy",

    // "ROE Score": Number, // 4, // return on equity
    // "ROE Recommendation": String, //"Buy",

    // "DE Score": Number, // 5, // debt to equity
    // "DE Recommendation": String, // "Strong Buy",

    // "PE Score": Number, // 5, // price earning
    // "PE Recommendation": String, //"Strong Buy",

    // "PB Score": Number, // 5, // price/book
    // "PB Recommendation": String //"Strong Buy"

    // ratingDetailsROAScore: Number, // 3, // return on assets
    // ratingDetailsROARecommendation: String, // "Neutral",
  }
});

module.exports = mongoose.model("Stock", StockSchema);
