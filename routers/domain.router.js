const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const {
  create,
  getById,
  remove,
  update,
  search,
  getAllDomainsByBrandId,
  getAllDomainsByTeamId,
  getDomainsByBrandId,
  getAll
} = require("../controllers/domain.controller");
const Role = require("../helpers/role");

router.get("/domains",authorize(), search);
router.get("/domains/getAll",authorize(), getAll);
router.get("/domains/getById/:id",authorize(), getById);
router.post("/domains",authorize(), create);
router.put("/domains/:id",authorize(), update);
router.delete("/domains/remove/:id",authorize(), remove);
router.get("/domains/getByTeamId/:team",authorize(), getAllDomainsByTeamId);

module.exports = router;
