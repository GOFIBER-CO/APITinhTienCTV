const mongoose = require('mongoose');

const userPermissionSchema = new mongoose.Schema({
    fieldName: {
        type: String,
        require: true
    },
    name: {
        type: String, 
        required: true,
    }
});



module.exports = mongoose.model('permissions', userPermissionSchema);