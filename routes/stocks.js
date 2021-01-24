const express = require("express"),
  router = express.Router({ mergeParams: true }),
  stockController = require("../controller/stock"),
  middleware = require("../middleware");

router.get("/:stockid",  stockController.getStockById);
router.post("/", stockController.addStock);

module.exports = router;
