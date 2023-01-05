const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const {
  create,
  getById,
  remove,
  update,
  search,
} = require("../controllers/domain.controller");
const Role = require("../helpers/role");

router.get("/domains", search);
router.get("/domains/getById/:id", getById);
router.post("/domains", create);
router.put("/domains/:id", update);
router.delete("/domains/remove/:id", remove);

module.exports = router;
