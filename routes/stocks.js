const express = require("express"),
  router = express.Router({ mergeParams: true }),
  stockController = require("../controller/stock")
  middleware = require("../middleware"),
  got = require("got");

require("dotenv").config();

router.get("/", middleware.checkCorrectUser, stockController.getUserStocks);

// SHOW ROUTE - show information of the chosen stock
router.get("/:stockid", middleware.checkCorrectUser, stockController.getStockById);

// DESTROY ROUTE - delete a tracked stock
router.delete("/:stockid", middleware.checkCorrectUser, stockController.removeStockFromUserTrackedList);

// EDIT ROUTE - edit a tracked stock
router.put("/:stockid", middleware.checkCorrectUser, stockController.addStockToUserTrackedList);

// CREATE route - Add tracked stocks to the stocks db
router.post("/", middleware.checkCorrectUser, stockController.createStock);

module.exports = router;
