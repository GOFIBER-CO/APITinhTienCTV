
const authorize = require('../middleware/authorize');
const Role = require('../helpers/role');
const express = require('express');
const router = express.Router();
const {getAllPermission} = require('../controllers/permission.controller');

router.get('/permission/getPermissions',getAllPermission)

module.exports = router