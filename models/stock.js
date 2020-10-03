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
    beta: String,  // => stability
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
    marketcap : String,
    netincome: String,  //  "Net Income per Share"
    EV: String, // Enterprise Value
    netDebtToEBITDA: String, // 0.695934725473018,
    DE : String, // Debt to Equity
    // dividend
    DY : String, //  Dividend Yield
    payoutratio : String,
    // valuation
    rev: String,  // "Revenue per Share"
    FCFS : String, // Free Cash Flow per Share
    BVS : String, // "Book Value per Share"
    // ratio
    PEratio : String,  // price to earning ratio,
    PSratio : String, // "Price to Sales Ratio"
    PBratio : String, // price to book
    currratio: String, // current ratio
    PFCFratio : String,  //  price-to-cash flow
    roe: String, // return on equity
  },
  financialgrowth: {
    date: String, //"2019-09-28",
    revenueGrowth: String, //-0.020410775805267418,
    netIncomeGrowth: String, //-0.07181132519191681,
    dividendsperShareGrowth: String, // 0.10494717879684691,
    freeCashFlowGrowth: String, //-0.08148656446406013,
    grossProfitGrowth: String, //-0.03384754367187423,
    epsgrowth: String, //-0.003330557868442893,  // earning per share
    debtGrowth: String, // -0.004408938830850867,
    operatingCashFlowGrowth: String, // -0.10386910142831314,
    operatingIncomeGrowth: String, // -0.09828203898558492,
    assetGrowth: String, // -0.07439742976279992,
  },
  rating: {
    date: String,  //"2020-07-17",
    "Overall Rating": String, //"S-",
    // overall, dcf, roe, de, pe, pb
    // overall, Discounted cash flow, return on equity, return on assets, debt to equity, price earning, price/book
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
