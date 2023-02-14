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
  getLinkManagementsByDomainId,
  getLinkManagementsByTeamId,
  getLinkManagementsByBrandId,
  getLinkManagementsByTeamUser,
  createExcel,
  exportExcelTeam
} = require("../controllers/linkManagement.controller");
const Role = require("../helpers/role");

router.get("/link-managements-excel-teams", exportExcelTeam)
router.get("/link-managements", authorize(), search);
router.get("/link-managements/getById/:id", authorize(), getById);
router.post("/link-managements", authorize(), create);
router.post("/link-managements-excel", authorize(), createExcel);
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
router.get(
  "/link-managements/getLinkManagementsByDomainId",
  // authorize(),
  getLinkManagementsByDomainId
);
router.get(
  "/link-managements/getLinkManagementsByTeamId",
  // authorize(),
  getLinkManagementsByTeamId
);
router.get(
  "/link-managements/getLinkManagementsByBrandId",
  // authorize(),
  getLinkManagementsByBrandId
);
router.get(
  "/link-managements/getLinkManagementsByTeamUser",
  // authorize(),
  getLinkManagementsByTeamUser
);

module.exports = router;
