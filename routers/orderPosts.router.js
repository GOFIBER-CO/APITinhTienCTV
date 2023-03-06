const express = require("express");
const router = express.Router();
const orderPostController = require("./../controllers/oderPosts.controller");

router.post("/order-post/insert", orderPostController.insertNewOrderPosts);
router.get("/order-post/list", orderPostController.getListOrderPosts);
router.delete("/order-post/delete/:id", orderPostController.deleteRecord);
router.patch("/order-post/update/:id", orderPostController.updateRecord);
module.exports = router;
