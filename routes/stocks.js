const express = require("express"),
  router = express.Router({ mergeParams: true }),
  stockController = require("../controller/stock"),
  middleware = require("../middleware");

router.get("/:stockid", middleware.checkCorrectUser, stockController.getStockById);
router.post("/", middleware.checkCorrectUser, stockController.addStock);

module.exports = router;
