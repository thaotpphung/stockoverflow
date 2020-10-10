# StockOverflow
>  Stock tracker and visualization 

# Contents  
* [Installation](#installation)  
* [Features](#features)
    * [Register](#register)
    * [Login](#login)
    * [Reset Password](#reset-password)
    * [Landing Page](#landing-page)
    * [Dash Board](#dash-board)
        * [Search and Add stock](#search-and-add-stock)
        * [Delete stock](#delete-stock)
    * [Stock Detail](#detail)
        * [OHLC Graph](#ohlc-graph)
        * [Trade options](#trade-options)
            * [Buy/Sell Stock](#buy/sell-stock)
    * [Portfolio](#portfolio)
        * [Assets](#assets)
        * [Transaction History](#transaction-history)
        

## Installation

### 1. Clone project by using ```git clone```
```
$ git clone git@github.com:thaotpphung/stockapp.git
$ cd stockapp
```

### 2. Install MongoDB
[MongoDB Download Page](https://docs.mongodb.com/manual/administration/install-community/)

### 3. Run application

```
$ npm install
$ node app.js
```

## Features

### Register


The app restricts some rules on registered information such as:
+ Length of username, password should be sufficiently long
+ Should give a correct email (e.g., someuser@somedomain.com)
+ First name/ last name should not contain special characters (e.g., %@&^%*#^)
+ ...

![Alt text](screens/signup.gif?raw=true "Sign Up")

### Login

![Alt text](screens/login.gif?raw=true "Login")

### Reset Password

User can reset password by providing the email was provided ealier. An confirmation email is sent to the user with a link to reset password.  

![Alt text](screens/reset.gif?raw=true "Login Screen")
![Alt text](screens/reset2.gif?raw=true "Login Screen")

## Landing Page

#### Display list of interested stocks

After succesfully logged in, user will be redirect to the landing page, which includes the top gainer, top loser, and top active stocks of the market. 

![Alt text](screens/landing_loggedin.png?raw=true "Login Screen")

## Dash Board

The dashboard shows the tracked stocks and their current price changes compared to the price of last closing day of stock market. It also shows the graph for stock data of up to 30 days.

![Alt text](screens/dashboard.png?raw=true "Dash Board")

### Search and Add stock

Users can search for stocks that they want to track, the system then add the desired stock to the tracked list.

![Alt text](screens/search.gif?raw=true "Search")

### Delete Stock

Users can remove the stocks that they no longer interested in by right hovering over the stock. 

![Alt text](screens/delete.gif?raw=true)

## Detail 

The stock detail page shows the OHLC graph for the chosen stock. It also shows relevant information related to the company, which includes:
* Latest trade: 
    * Latest OHLC prices, adjust close, volumn, unadjusted volumn and VWAP
* Profile: 
    * Beta, exchange, industry, sector, website and CEO
* Key metrics: 
    * Market Cap, Free Cash Flow per Share, Net Income, Book Value per Share, 
    Revenue per Share, Price to Earning ratio,
    Enterprise Value, Price to Sales Ratio,
    Debt to Equity, Price to Book ratio,
    Net Debt-to-EBITDA, Price-to-cash Flow,
    Dividend Yield, Return on Equity,
    Payout ratio, Current ratio

### OHLC Graph

![Alt text](screens/ohlc.png?raw=true)

### Trade Options

#### Buy/Sell stock

Users can keep track of their trading history by adding trade decisions, buying stock or selling stock.
They can either add an entry in the stock detail page or in the porfolio page. 

![Alt text](screens/purchase.gif?raw=true "Purchase")

## Portfolio

This feature helps user keeping track of user's asset - which stocks user owns and transaction history - the amount and time when the user made a transaction. When purchasing/selling 
 a new stock that is not in the tracked list, the users can hover on the stock to add the new stock to the tracked list

![Alt text](screens/portfolio.png?raw=true "Portfolio")

### Assets
![Alt text](screens/assets.png?raw=true "Portfolio")

### Transaction History
![Alt text](screens/history.png?raw=true "Portfolio")

