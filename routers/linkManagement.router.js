const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const {
  create,
  getById,
  remove,
  update,
  search,
} = require("../controllers/linkManagement.controller");
const Role = require("../helpers/role");

router.get("/link-managements", search);
router.get("/link-managements/getById/:id", getById);
router.post("/link-managements", create);
router.put("/link-managements/:id", update);
router.delete("/link-managements/remove/:id", remove);

module.exports = router;
