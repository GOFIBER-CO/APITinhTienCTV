const express = require("express");
const router = express.Router();
const orderPostController = require("./../controllers/oderPosts.controller");
const authorize = require("../middleware/authorize");

router.post(
  "/order-post/insert",
  authorize(),
  orderPostController.insertNewOrderPosts
);
router.get(
  "/order-post/list",
  authorize(),
  orderPostController.getListOrderPosts
);
router.delete(
  "/order-post/delete/:id",
  authorize(),
  orderPostController.deleteRecord
);
router.patch(
  "/order-post/update",
  authorize(),
  orderPostController.updateRecord
);
module.exports = router;
