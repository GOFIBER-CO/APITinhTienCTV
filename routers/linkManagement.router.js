const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const {
  create,
  getById,
  remove,
  update,
  search,
  getLinkManagementsByCollaboratorId,
  getStatisticByBrand,
} = require("../controllers/linkManagement.controller");
const Role = require("../helpers/role");

router.get("/link-managements", authorize(), search);
router.get("/link-managements/getById/:id", authorize(), getById);
router.post("/link-managements", authorize(), create);
router.put("/link-managements/:id", authorize(), update);
router.delete("/link-managements/remove/:id", authorize(), remove);
router.get(
  "/link-managements/getLinkManagementsByCollaboratorId",
  authorize(),
  getLinkManagementsByCollaboratorId
);
router.get(
  "/link-managements/getStatisticByBrand",
  authorize(),
  getStatisticByBrand
);

module.exports = router;
