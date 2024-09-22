const Admin = require("../models/adminSchema")

exports.checkRole = async (req, res, next) => {
try {
    const id = req.id
    const admin = await Admin.findById(id)
    if(!admin) return res.status(404).json({message: "UnAuthorized"})
    if(admin.adminRole !== "superAdmin") {
       return res.status(403).json({message: "UnAuthorized"})
    }
    next()
} catch (error) {
    res.status(500).json({message: error.message})
}
    
}