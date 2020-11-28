const express = require("express"),
  router = express.Router({ mergeParams: true }),
  stockController = require("../controller/stock"),
  middleware = require("../middleware");

router.get("/", middleware.checkCorrectUser, stockController.getStocks);
router.get("/:stockid", middleware.checkCorrectUser, stockController.getStock);
router.delete("/:stockid", middleware.checkCorrectUser, stockController.deleteStock);
router.put("/:stockid", middleware.checkCorrectUser, stockController.editStock);
router.post("/", middleware.checkCorrectUser, stockController.createStock);


module.exports = router;
