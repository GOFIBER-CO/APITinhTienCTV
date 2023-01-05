const express = require("express");
const router = express.Router();
const fpController = require("../controllers/fp.controller");
const authorize = require("../middleware/authorize");

router.post("/fp/insert", fpController.createFP);
router.put("/fp/update/:id", authorize(), fpController.updateFP);
router.delete("/fp/delete/:id", authorize(), fpController.deleteFP);
router.get("/fp/getById/:id", fpController.getFPById);
router.get("/fp/getPaging", fpController.getPagingFP);

module.exports = router;
