const express = require("express");
const router = express.Router();
const authorize = require("../middleware/authorize");
const Role = require("../helpers/role");
const {
  getAllRole,
  editRolePermission,
  addNewRole,
  deleteRole,
  editRole,
} = require("../controllers/role.controller.js");
const permissionFieldName = require("../helpers/permissionFieldName.js");
const permissionFunction = require("../helpers/permissionFunction.js");

router.get('/roles/getRoles',getAllRole)
router.patch('/roles/editRolePermission', authorize(permissionFunction.USER,permissionFieldName.EDIT), editRolePermission)
router.post('/roles/addNewRole', authorize(permissionFunction.USER,permissionFieldName.ADD), addNewRole)
router.post('/roles/deleteRole', authorize(permissionFunction.USER, permissionFieldName.DELETE), deleteRole)
router.post('/roles/editRole',  authorize(permissionFunction.USER, permissionFieldName.EDIT, editRole), editRole)

module.exports = router;
