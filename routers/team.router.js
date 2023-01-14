const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const teamController = require("../controllers/team.controller");

router.get("/teams", authorize(), teamController.getPaging);
router.post("/teams", authorize(), teamController.create);
router.put("/teams/:id", authorize(), teamController.update);
router.delete("/teams/:id", authorize(), teamController.delete);
router.get("/teams/getById/:id", authorize(), teamController.getById);
router.get("/teams/all", authorize(), teamController.getAll)
router.get(
  "/teams/getTeamByBrand/:brand",
  authorize(),
  teamController.getTeamByBrand
);

module.exports = router;
