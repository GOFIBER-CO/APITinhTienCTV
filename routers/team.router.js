const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const teamController = require("../controllers/team.controller");

router.get("/team", teamController.getPaging);
router.post("/team", teamController.create);
router.put("/team/:id", teamController.update);
router.delete("/team/:id", teamController.delete);
router.get("/team/getById/:id", teamController.getById);

module.exports = router;
