const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;

const userPermissionSchema = new mongoose.Schema({
    userId : {
        type: String,
        required: true
    },
    fieldName: {
        type: String,
        require: true
    },
    view : {
        type: Boolean,
        required: true,
        default : false,
    },
    edit : {
        type: Boolean,
        required: true,
        default : false,
    },
    del : {
        type: Boolean,
        required: true,
        default : false,
    },
   
}, {timestamps: true});

userPermissionSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
    }
});


module.exports = mongoose.model('UserPermission', userPermissionSchema);