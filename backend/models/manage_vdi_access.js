const mongoose = require('mongoose');

var revoke_manage_vdi_access = mongoose.Schema({
    deleted_user: {
        type: String,
        required: true,
        unique: true
    },
    deleted_from_userGroup: {
        type: String,
        required: true
    },
    perfrom_delete_by_user: {
        type: String,
        required: true
    },
    date_time_of_delete: {
        type: Date,
        default: Date.now,
        required: true
    }
}
    // {versionKey: 'versionKey' }
)

//Schema for assigning user in manage_vdi_access
var assign_manage_vdi_access = mongoose.Schema({
    assigned_user: {
        type: String,
        required: true
    },
    assigned_by_user: {
        type: String,
        required: true
    },
    assigned_to_userGroup: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

const revoke_manage_vdi_access_table = new mongoose.model("revoke_manage_vdi_access", revoke_manage_vdi_access);
const assign_manage_vdi_access_collection = new mongoose.model("assign_manage_vdi_access", assign_manage_vdi_access);
module.exports = {revoke_manage_vdi_access_table,assign_manage_vdi_access_collection};

