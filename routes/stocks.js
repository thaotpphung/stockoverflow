const express = require("express"),
  router = express.Router({ mergeParams: true }),
  stockController = require("../controller/stock")
  middleware = require("../middleware"),
  got = require("got");

require("dotenv").config();

router.get("/", middleware.checkCorrectUser, stockController.getStocks);

// SHOW ROUTE - show information of the chosen stock
router.get("/:stockid", middleware.checkCorrectUser, stockController.getStock);

// DESTROY ROUTE - delete a tracked stock
router.delete("/:stockid", middleware.checkCorrectUser, stockController.deleteStock);

// EDIT ROUTE - edit a tracked stock
router.put("/:stockid", middleware.checkCorrectUser, stockController.editStock);

// CREATE route - Add tracked stocks to the stocks db
router.post("/", middleware.checkCorrectUser, stockController.createStock);


module.exports = router;
