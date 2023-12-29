const mongoose = require('mongoose');

var admin_portal_logs = mongoose.Schema({
    
    user: {
        type: String,
        required: true
    },
    userGroup: {
        type: String
    },
    by_user: {
        type: String,
        required: true
    },
    date_time: {
        type: Date,
        default: Date.now,
        required: true
    },
    action:{
        type:String,
        required:true
    }
    
}
    // {versionKey: 'versionKey' }
)

const admin_portal_logs_collection = new mongoose.model("admin_portal_logs", admin_portal_logs);
module.exports = { admin_portal_logs_collection };