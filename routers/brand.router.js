const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const {
  create,
  getById,
  remove,
  update,
  search,
} = require("../controllers/brand.controller");
const Role = require("../helpers/role");

router.get("/brands", search);
router.get("/brands/getById/:id", getById);
router.post("/brands", create);
router.put("/brands/:id", update);
router.delete("/brands/remove/:id", remove);

module.exports = router;
