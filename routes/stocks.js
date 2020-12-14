const express = require("express"),
  router = express.Router({ mergeParams: true }),
  stockController = require("../controller/stock"),
  middleware = require("../middleware");

router.get("/:stockid", middleware.checkCorrectUser, stockController.getStockById);
// router.delete("/:stockid", middleware.checkCorrectUser, stockController.deleteStockById);
// router.put("/:stockid", middleware.checkCorrectUser, stockController.editStockById);
router.post("/", middleware.checkCorrectUser, stockController.addStock);

module.exports = router;
