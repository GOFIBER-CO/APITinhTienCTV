const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const {
  countWord,
} = require("../controllers/countWordInGoogleDocs.controller");

router.post("/count", authorize(), countWord);

module.exports = router;
