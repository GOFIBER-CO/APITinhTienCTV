const Role = require("../models/role.model");

async function getAllRole(req, res){
   try {
       const roles = await Role.find()
       return res.status(200).json({roles: roles})
   } catch (error) {
       console.log(error)
       return res.status(500)
    }
}
const editRolePermission = async (req, res) => {
    try {
        const result = await Role.findByIdAndUpdate(req.body.roleId, {
            permission: req.body.permission
        })
        return res.status(200).json({message: 'success', permission: result})
    } catch (error) {
        return res.status(400)
    }
}

const deleteRole = async (req, res) => {
    try {
        const result = await Role.findByIdAndDelete(req.body.id)
        return res.status(200).json({message: "success"})
    } catch (error) {
        console.log(error)
        return res.status(400)
    }
}



const addNewRole = async (req, res) => {
    try {
        const result = await Role.create({
            name: req.body.role
        })
        return res.status(200).json({role: result})
    } catch (error) {
        console.log(error)
        return res.status(400)
    } 
}

const editRole = async (req, res) => {
    try {
        const result = await Role.findByIdAndUpdate(req.body.id, {name: req.body.role})
        return res.status(200).json({message: "Success"})
    } catch (error) {
        console.log(error)
        return res.status(400)
    }
}
module.exports = {
    getAllRole,
    editRolePermission,
    addNewRole,
    deleteRole,
    editRole
}