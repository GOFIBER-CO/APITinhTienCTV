const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const {
  create,
  getById,
  remove,
  update,
  search,
  getCollaboratorsByDomainId,
} = require("../controllers/collaborator.controller");
const Role = require("../helpers/role");

router.get("/collaborators", search);
router.get("/collaborators/getById/:id", getById);
router.post("/collaborators", create);
router.put("/collaborators/:id", update);
router.delete("/collaborators/remove/:id", remove);
router.get("/collaborators/getCollaboratorsByDomainId", getCollaboratorsByDomainId);

module.exports = router;
