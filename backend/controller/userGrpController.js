const express = require('express');
const app = express();
const userModel = require("../models/model");
const cookies = require("cookie-parser");
app.use(cookies());
app.use(express.json());
const jwt = require("jsonwebtoken");
const JWT_KEY = require("../secrets").JWT_KEY
const adVar = require('../ad/adfunc');
const promiseVar = require('../promise/promisefuncmain')
const { exec } = require("child_process");
const { Parser } = require('json2csv');
const fs = require('fs');
const manage_vdi_access = require("../models/manage_vdi_access");

async function getUsergroupAsList(req, res) {

    let token;
    let username;
    if (req.cookies.login) {
        token = req.cookies.login
        let payload = await jwt.verify(token, JWT_KEY);
        username = payload.payload;

        const username1 = await userModel.findOne({ "username": payload.payload })
        req.role = username1.role;
    }



    // end of role fetching

    let user = userModel.findOne({ "username": username }, async function (err, result) {
        let userGroup;
        if (err) {
            console.log("No groups here in getusergroupsaslist")
        }
        else {

            let user = await userModel.findOne({ "username": username });

            userGroup = user.userGroup;
            // console.log(userGroup)
        }

        res.render("managevdigroup", { "userGroup": userGroup })

    });

}

//Internal function to convert array of objects to a CSV file.
function convert_to_csv(finalMemberInfoArray, group) {
    try {
        const json2csvParser = new Parser();
        csv = json2csvParser.parse(finalMemberInfoArray);
        console.log("the prepared group is:", group);
        // console.log("Finalised csv is:", csv);
        fs.writeFileSync(`./backend/downloads/files/${group}.csv`, csv, function () {
            console.log("csv created successfully.")
        })
    }
    catch (err) {
        console.log("error in parsing CSV is:", err.message);
    }
}

//For fetching member info filtered finally
function finalMemberInfoArrayFunc(fetchedNamesArray) {
    var fetchedMembersInfoArray = [];
    var finalMemberInfoArray = [];
    return new Promise((resolve, reject) => {
        adVar.adFunc().then(async () => {
            let array = [''];
            fetchedNamesArray = fetchedNamesArray.filter(x => !array.includes(x));
            console.log("entered in inner func", fetchedNamesArray);
            for (var fetchedNames of fetchedNamesArray) {
                // console.log("one by one name is:", fetchedNames)
                await adVar.memberArrayInfo(fetchedNames)
                    .then((memberinfo) => {
                        fetchedMembersInfoArray.push(memberinfo);
                    });
            }
            console.log("the universal finalised array-upar is:", fetchedMembersInfoArray);
            return fetchedMembersInfoArray;
        })
            .then((fetchedMembersInfoArray) => {
                // console.log("the universal finalised array is:", fetchedMembersInfoArray);
                fetchedMembersInfoArray.forEach(element => {
                    finalMemberObj = { Name: "", Contact: "", Email: "" };
                    if (element.cn != undefined) {
                        finalMemberObj.Name = element.cn;
                    } else {
                        finalMemberObj.Name = " Name not available in AD";
                    }
                    if (element.telephoneNumber != undefined) {
                        finalMemberObj.Contact = element.telephoneNumber;
                    } else {
                        finalMemberObj.Contact = "Contact not available";
                    }
                    if (element.mail != undefined) {
                        finalMemberObj.Email = element.mail;
                    } else {
                        finalMemberObj.Email = " Email not available";
                    }
                    finalMemberInfoArray.push(finalMemberObj);

                    //sorts the unfiltered array
                    const sortByName = finalMemberInfoArray => {
                        finalMemberInfoArray.sort((a, b) => {
                            return a.Name.charCodeAt(0) - b.Name.charCodeAt(0);
                        });
                    };
                    sortByName(finalMemberInfoArray);

                });
                // console.log("desired=",finalMemberInfoArray)
                resolve(finalMemberInfoArray);
            })
    })
}

//Fetching the members of a particular group
async function getUserGroupMembers(req, res) {
    let userGroup = req.params.userGroup;
    console.log("param is :", req.params.userGroup);
    console.log("group name:", userGroup)
    let username;
    if (req.cookies.login) {
        token = req.cookies.login;
        let payload = await jwt.verify(token, JWT_KEY);
        username = payload.payload;
    }

    let check = await userModel.findOne({ 'username': username });
    console.log(check.username)
    let checkuserGroup = check.userGroup;
    let flag = false;
    for (var i = 0; i < checkuserGroup.length; i++) {
        if (checkuserGroup[i] == userGroup) {
            flag = true;
            break;
        }
    }

    let array = [];
    if (flag == true) {
        console.log(userGroup)
        var fetchedNamesArray = [];
        adVar.adFunc()
            .then(() => {
                adVar.fetchGroupUsers(userGroup).then(async (groupval) => {
                    console.log("the value is:", groupval)
                    await adVar.fetchGroupUsers(userGroup)

                        .then((teamMemberArray) => {
                            // console.log("Type is :", typeof (teamMemberArray));
                            console.log("output in for is :", teamMemberArray);
                            if (typeof (teamMemberArray) === 'string') {
                                console.log("if")
                                var groupvalArray = [];
                                groupvalArray.push(teamMemberArray);
                                console.log("outside array is:", groupvalArray);
                                for (var fetchedNames of groupvalArray) {
                                    fetchedNamesArray.push(fetchedNames.substring(
                                        fetchedNames.indexOf('=') + 1,
                                        fetchedNames.lastIndexOf(',C')))
                                }
                                return fetchedNamesArray;
                            }
                            else {
                                console.log("else in ")
                                for (var fetchedNames of teamMemberArray) {
                                    fetchedNamesArray.push(fetchedNames.slice(3, -30))
                                }
                                return fetchedNamesArray;
                            }
                        })
                    await finalMemberInfoArrayFunc(fetchedNamesArray).then((finalMemberInfoArray) => {
                        console.log("now it will render:", finalMemberInfoArray)
                        res.render('managevdigroup_teaminfo', { members: finalMemberInfoArray, groupName: userGroup });
                        convert_to_csv(finalMemberInfoArray, userGroup);
                    });
                })
                    .catch(() => {
                        res.render('managevdigroup_teaminfo', { users: array })

                        console.log("not able to fetch in function in getusergroupmembers")
                    })
            })
    }
    else {

        res.render('404');

    }
}

//For fetching last five logs of assign user from local database
async function fetch_last_five_logs(){
    let result = await manage_vdi_access.assign_manage_vdi_access_collection.find().limit(5).sort({"timestamp":-1});
    return result;
    }

//Function for fetching the availbale users to the dropdown.
async function addmembersPage(req, res) {
    let userGroup = req.params.userGroup;
    // The Promise Function defined above this code snippet.
    let allUsers = await promiseVar.addmembersPagePromiseFunc;
    let groupUsers = await promiseVar.promiseUsers(userGroup);
    let result = allUsers.filter(x => !groupUsers.includes(x));
    var message = "";
    let fetched_logs = await fetch_last_five_logs();
    res.render('addUser', { availableUsers: result, groupName: userGroup, message: message, fetched_logs });
}

//Function for adding user to a given group.
async function addinAd(req, res) {
    const userName = req.body.selectuserName;
    const group = req.body.usergroupName;
    let result = [];
    let message = "";
    let groupUsers = [];
    let allUsers = [];
    try {
        adVar.adFunc()
            .then(() => {
                adVar.searchUser(userName)
                    .then(async (info) => {
                        let fetched_logs=[];
                        dn = info.dn;
                        await adVar.useraddtoGroup(group, dn).then(async (flag) => {
                            console.log("the flag is:", flag);

                            if (flag == 1) {
                                message = "User Added Successfully";
                                //Creating entry in admin logs database.
                                assigned_user_log = await manage_vdi_access.assign_manage_vdi_access_collection.create({
                                    "assigned_user": userName,
                                    "assigned_by_user": req.cookies.uname,
                                    "assigned_to_userGroup": group,
                                    "timestamp": new Date()
                                })
                            }

                            else if (flag == 0) {
                                message = "Permission Denied.Please contact admin";
                            }
                            groupUsers = await promiseVar.promiseUsers(group);
                            allUsers = await promiseVar.addmembersPagePromiseFunc;
                            // console.log("the user of " + group + " is= ", groupUsers)
                            result = allUsers.filter(x => !groupUsers.includes(x));
                            fetched_logs = await fetch_last_five_logs();
                            res.render('addUser', { availableUsers: result, groupName: group, message: message, fetched_logs });
                        });
                    })
            })
    }
    catch (err) {
        console.log("Error in assigning new user is:", err.message);
    }
}

async function getRemoveUser(req, res) {
    let userGroup = req.params.userGroup;
    let users = await promiseVar.promiseUsers(userGroup);

    let revoked_users ;
    await manage_vdi_access.revoke_manage_vdi_access_table.find({}, function(err, result){
        revoked_users = result;
    }).sort({ "date_time_of_delete": -1 }).limit(5).clone()

    res.render('revokeUser', { users: users, userGroup: userGroup, bool: 2, revoked_users: revoked_users })

}

async function postRemoveUser(req, res) {
    let bool;
    let usernameToDelete = req.body.usernameToDelete;
    let userGroup = req.params.userGroup;
    await adVar.adFunc()
        .then(async () => {
            await adVar.searchUser(usernameToDelete).then(async () => {
                bool = await adVar.delFromGroup(info.dn, userGroup);
                if (bool == 1) {
                    let revokeLog = await manage_vdi_access.revoke_manage_vdi_access_table.create({
                        "deleted_user": usernameToDelete,
                        "deleted_from_userGroup": userGroup,
                        "perfrom_delete_by_user": req.cookies.uname,
                        "date_time_of_delete": new Date()
                    });
                }
            })
        })

   
    let revoked_users ;
    await manage_vdi_access.revoke_manage_vdi_access_table.find({}, function(err, result){
        revoked_users = result;
    }).sort({"date_time_of_delete":-1}).limit(5).clone()
    let users = await promiseVar.promiseUsers(userGroup);
    await res.render('revokeUser', { users: users, userGroup: userGroup, bool: bool, revoked_users: revoked_users });

}


module.exports = {
    getUserGroupMembers,
    getUsergroupAsList,
    addmembersPage,
    addinAd,
    postRemoveUser,
    getRemoveUser
}
