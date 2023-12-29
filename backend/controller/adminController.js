const express = require('express');
const app = express();
const userModel = require("../models/model");
const adminModel = require("../models/admin_portal_logs");
const manage_vdi_access = require("../models/manage_vdi_access")

//For displaying and fetching the table from the local mongo dataabse of all the users
async function adminTable(req, res){
    let resultArray=[];
    resultArray= await userModel.find({}).sort({"username":1});
    res.render('adminTable',{data: resultArray, delete_user_bool:0, delete_userGroup_bool:0})
}

async function deleteUserFromDB(req, res){
    let usernameToDeleteFromDB = req.params.username;
    let delete_user_bool = 1;
    let result = await userModel.findOneAndDelete({username:usernameToDeleteFromDB})
    let resultArray= await userModel.find({}).sort({"username":1});
    admin_portal_logs_created_log = await adminModel.admin_portal_logs_collection.create({
        "user": usernameToDeleteFromDB,
        "userGroup": "",
        "by_user": req.cookies.uname,
        "date_time": new Date(),
        "action":"delete"
    })
    
    res.render("adminTable", {data:resultArray, delete_user_bool :delete_user_bool, delete_userGroup_bool:0})
}

// drop userGroup from a user;
async function delete_usergroup_from_user(req, res){
    let delete_from_username = req.body.delete_operation_on_username;
    let userGroup_to_delete = req.body.userGroup_to_delete;

    let updatedUserGroup = [];
    let delete_userGroup_bool;

    admin_portal_logs_created_log = await adminModel.admin_portal_logs_collection.create({
        "user": delete_from_username,
        "userGroup": userGroup_to_delete,
        "by_user": req.cookies.uname,
        "date_time": new Date(),
        "action":"delete"
    })

    let result = await userModel.findOne({'username':delete_from_username})
    for(var i = 0; i<result.userGroup.length; i++){
        if(userGroup_to_delete != result.userGroup[i]){
            updatedUserGroup.push(result.userGroup[i]);
        }
    }
    // now update the database with new userGroup array
    const filter = { username: delete_from_username };
    const update = { userGroup: updatedUserGroup};
    await userModel.findOneAndUpdate(filter, update);
    delete_userGroup_bool = 1;
    //whole data for render
    let resultArray= await userModel.find({}).sort({"username":1});
    res.render("adminTable", {data:resultArray, delete_user_bool :0, delete_userGroup_bool : delete_userGroup_bool});
}


async function all_logs(req, res){
    try{
        let manage_vdi_access_assign_logs = await manage_vdi_access.assign_manage_vdi_access_collection.find().sort({"timestamp":-1});
        let manage_vdi_access_revoke_result = await manage_vdi_access.revoke_manage_vdi_access_table.find({}).sort({'date_time_of_delete':-1});
        let admin_portal_logs = await adminModel.admin_portal_logs_collection.find({}).sort({'date_time':-1});
        res.render('logs', { manage_vdi_access_assign_logs, revoke_vdi:manage_vdi_access_revoke_result, admin_portal_logs:admin_portal_logs});
        }

    catch(err){
        res.render('error_page',{error:err})
    }

}


module.exports = {
    adminTable,
    deleteUserFromDB,
    delete_usergroup_from_user,
    all_logs
}
