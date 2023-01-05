const Permission = require('../models/permission.model')

const getAllPermission = async (req, res) => {
    try {
        const result = await Permission.find()
        return res.status(200).json({permissions: result})
    } catch (error) {
        console.log(error)
        return res.status(400)
    }
}



module.exports = {
    getAllPermission
}