const express = require('express');
const app = express();
const path = require("path");
const userModel = require("../models/model");
const cookies = require("cookie-parser");
app.use(cookies());
app.use(express.json());
const jwt = require("jsonwebtoken");
const JWT_KEY = require("../secrets").JWT_KEY
const { promiseAllUsers, promiseUserGroup } = require("../promise/promisefuncmain");
const rbac = require('../middlewares/rbac')
const { groupToRemove } = require("../service/element_groupArray");
const adminModel = require("../models/admin_portal_logs");
const { exec } = require("child_process");
const adVar = require('../ad/adfunc');
const { Parser } = require('json2csv');
const fs = require('fs');

var userLogon;
var memberLogon;
var universal;

function loginPage(req, res) {
    res.render('login', { flag: true })
}

//this is the confidential info
async function loginUser(req, res) {


    let uid = req.body.username; // this is unique id genr ated by mongo
    uid = uid.toLowerCase();
    let token = await jwt.sign({ payload: uid }, JWT_KEY) // is line s signature bnega
    // console.log(uid)
    let flag = true;
    await res.cookie('uname', uid, httpOnly = true);
    await res.cookie('login', token, { httpOnly: true, secure: false, samesite: 'strict' });
    let Role = await rbac(req, res);
    //  here i need to write if username is not available inside DB then you need to create else just leave it as it is
    let username = uid;
    // console.log("under login function ", username)
    let userGroup = [];
    let role = "user";
    await userModel.findOne({ "username": username }, async function (err, result) {

        if (result == null) {
            let user = await userModel.create({
                "username": username,
                "userGroup": userGroup,
                "role": role
            });
            console.log(user);
            res.redirect("/");

        }
        else {
            res.redirect("/");
        }
    }).clone()
    // await q;
    // q.clone();


}

async function logout(req, res) {
    return res.clearCookie('login').redirect("/login")
}

//For fetching member info filtered finally
function finalMemberInfoArrayFunc(fetchedNamesArray) {
    var fetchedMembersInfoArray = [];
    var finalMemberInfoArray = [];
    return new Promise((resolve, reject) => {
        adVar.adFunc().then(async () => {
            let array = [''];
            fetchedNamesArray = fetchedNamesArray.filter(x => !array.includes(x));
            for (var fetchedNames of fetchedNamesArray) {
                await adVar.memberArrayInfo(fetchedNames)
                    .then((memberinfo) => {
                        fetchedMembersInfoArray.push(memberinfo);
                    });
            }
            return fetchedMembersInfoArray;
        })
            .then((fetchedMembersInfoArray) => {
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

                    //filters the unsorted array
                    finalMemberInfoArray = finalMemberInfoArray.filter((value, index, self) =>
                        index === self.findIndex((t) => (
                            t.Name === value.Name
                        ))
                    )
                    // for (member of finalMemberInfoArray) {
                    //     let Name = JSON.stringify(member.Name);
                    //     member = Name.charCodeAt(0).toUpperCase()+ Name.slice(1);
                    //     finalMemberInfoArray.push(member);
                    // }
                    //sorts the unfiltered array
                    const sortByName = finalMemberInfoArray => {
                        finalMemberInfoArray.sort((a, b) => {
                            return a.Name.charCodeAt(0) - b.Name.charCodeAt(0);
                        });
                    };
                    sortByName(finalMemberInfoArray);
                });
                resolve(finalMemberInfoArray);
            })
    })
}

//search and fetch for single user
findone = (async (req, res) => {
    universal = req.cookies.uname;
    // console.log("my info uname", universal)
    if (universal) {
        adVar.adFunc(universal)
            .then(() => {
                adVar.searchUser(universal).then((info) => {
                    uname = info.sAMAccountName;
                    // to fetch the command output through child_process modules
                    exec(`Get-ADUser -Identity ${uname} -Properties lastLogonTimestamp | Select @{Name='lastLogonTimestamp';Expression={[DateTime]::FromFileTime($_.lastLogonTimestamp)}}`, { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
                        // do whatever with stdout
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.log(`stderr: JSON.Parse(${stderr})`);
                            return;
                        } else
                            userLogon = stdout.slice(43);
                        res.render('myinfo', { userinfo: info, userLogon });
                    })
                });
            })
    }
    else {
        searchUser.catch((err) => {
            console.log(err)
        })
    }

});

//Internal function to convert array of objects to a CSV file.
function convert_to_csv(finalMemberInfoArray) {
    try {
        const json2csvParser = new Parser();
        csv = json2csvParser.parse(finalMemberInfoArray);
        // console.log("the prepared csv is:", csv);
        fs.writeFileSync("./backend/downloads/files/myallteamMembers.csv", csv, function () {
            console.log("csv created successfully.")
        })
    }
    catch (err) {
        console.log("error in parsing CSV is:", err.message);
    }
}

//search and findall
findall = (async (req, res) => {
    var fetchedNamesArray = [];
    let universal = req.cookies.uname;
    if (universal) {
        const userName = universal;
        // console.log("the clicked value is:", userName);
        userModel.find({ username: `${universal}` })
            .then(data => {
                let userGroupsArray = data[0].userGroup;
                if (!userGroupsArray) {
                    console.log("no team under you.", userGroupsArray)
                    res.send(data);
                    return;
                } else {
                    console.log("");
                    // console.log("the groups are:", userGroupsArray)
                    adVar.adFunc()
                        .then(async () => {
                            for (let userGroup of userGroupsArray) {
                                await adVar.fetchGroupUsers(userGroup)
                                    .then((teamMemberArray) => {
                                        // console.log("output in for is :", teamMemberArray);
                                        if (typeof (teamMemberArray) === 'string') {
                                            var groupvalArray = [];
                                            groupvalArray.push(teamMemberArray);
                                            // console.log("outside array is:", groupvalArray);
                                            for (var fetchedNames of groupvalArray) {
                                                fetchedNamesArray.push(fetchedNames.substring(
                                                    fetchedNames.indexOf('=') + 1,
                                                    fetchedNames.lastIndexOf(',C')))
                                            }
                                            return fetchedNamesArray;
                                        }
                                        else if ((typeof (teamMemberArray) === 'object')) {
                                            for (var fetchedNames of teamMemberArray) {
                                                fetchedNamesArray.push(fetchedNames.slice(3, -30))
                                            }
                                            return fetchedNamesArray;
                                        }
                                        else {
                                            return fetchedNamesArray;
                                        }
                                    })
                                    .catch(err => {
                                        console.log("main error is:", err)
                                    })
                            }
                            // console.log("the desired names are:", fetchedNamesArray);
                            await finalMemberInfoArrayFunc(fetchedNamesArray).then((finalMemberInfoArray) => {
                                // console.log("now it will render:", finalMemberInfoArray)
                                res.render('./myteaminfo', { users: finalMemberInfoArray });
                                convert_to_csv(finalMemberInfoArray);
                            });

                        });
                }
            })
            .catch(err => {
                res.status(500).send({ message: "You have no team ,no username exists in local db:" + userName })
                return;
            })
    }
});

// for fetching the members through AD
memberinfo = (async (req, res) => {
    const user = req.body.memberName;
    // console.log('our data is in memberinfo with memberName as: ', user);
    if (user) {
        const userName = user;
        adVar.adFunc()
            .then(() => {
                // console.log("adfunc is running with:",userName)
                adVar.searchMember(userName).then((info) => {
                    // console.log('entry of memberone inside is: ', info);
                    // console.log("riitk is in memberinfo-last step-end")
                    exec(`Get-ADUser -Identity ${info.sAMAccountName} -Properties lastLogonTimestamp | Select @{Name='lastLogonTimestamp';Expression={[DateTime]::FromFileTime($_.lastLogonTimestamp)}}`, { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
                        // do whatever with stdout
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.log(`stderr: JSON.Parse(${stderr})`);
                            return;
                        } else
                            memberLogon = stdout.slice(43);
                        // console.log("the taken output in member is:", memberLogon);
                        res.render('./managevdigroup_memberinfo', { memberinfo: info, memberLogon });
                    })
                });
            })
    }
});

//For fetching last five logs of the admin portal.
async function fetch_last_five_logs(){
    let result = await adminModel.admin_portal_logs_collection.find().limit(5).sort({"date_time":-1});
    return result;
}

//for adding the new member in mongo db 
async function newUser(req, res) {
    let dataObj = req.body;
    // console.log(dataObj)
    let username = dataObj.username;
    let userGroup = dataObj.userGroup;
    let role = dataObj.role;
    let warn = 2;
    let db_flag = false;
    let userObj = await userModel.findOne({ 'username': username });
    // console.log("userObj=", userObj)
    if (userObj) {
        let user = await userModel.findOne({ "username": username });
        let flag = true;
        let userGroupA = user.userGroup;
        // console.log(userGroupA)
        // here i am checking that usergroup already exit or not.
        for (var i = 0; i < userGroupA.length; i++) {
            if (userGroup == userGroupA[i]) {
                flag = false;
                warn = 3;
                db_flag=false;
                break;
            }
        }
        if (flag) {
            warn = 1;
            userGroupA.push(userGroup);
            // console.log("After push")
            // for(var i = 0; i<userGroupA.length; i++){
            //     console.log(userGroupA[i]);
            // }
            const filter = { username: username };
            const update = { userGroup: userGroupA, role: role };
            let userGroupUpdate = await userModel.findOneAndUpdate(filter, update);
            db_flag = true;
        }
    }
    else {
        warn = 1;
        let user = await userModel
            .create({
                "username": username,
                "userGroup": userGroup,
                "role": role
            });
        db_flag = true;
    }
    let fetched_logs=[];

    if (db_flag == true) {
        console.log("Logs DB Creation Starts:");
        timestamp = new Date();
        admin_portal_logs_created_log = await adminModel.admin_portal_logs_collection.create({
            "user": username,
            "userGroup": userGroup,
            "by_user": req.cookies.uname,
            "date_time": new Date(),
            "action":"created"
        })
    }

    fetched_logs= await fetch_last_five_logs();

    // console.log(userObj)
    let groupArray1 = await promiseUserGroup;
    let groupArray2 = groupToRemove;
    let groupArray = groupArray1.filter(x => !groupArray2.includes(x));
    let usersArray = [];
    let usersArraySample = await promiseAllUsers;
    for (var i = 0; i < usersArraySample.length; i++) {
        usersArray[i] = usersArraySample[i].toLowerCase()
    }

    await res.render('userGroupAssign', {
        userGroupArray: groupArray,
        userNameArray: usersArray,
        warn: warn,
        fetched_logs
    })
}

//For getting all the users in admin portal form 
async function getNewUser(req, res) {

    let groupArray1 = await promiseUserGroup;
    let groupArray2 = groupToRemove;
    let groupArray = groupArray1.filter(x => !groupArray2.includes(x));
    // console.log(groupArray);
    // console.log(groupArray.length)
    // console.log(groupArray1.length)
    // console.log(groupArray2.length)
    let usersArray = [];
    let usersArraySample = await promiseAllUsers;
    for (var i = 0; i < usersArraySample.length; i++) {
        usersArray[i] = usersArraySample[i].toLowerCase();
    }

    let fetched_logs = await fetch_last_five_logs();
    // console.log("fetched logs are:",fetched_logs);
    res.render('userGroupAssign', {
        userGroupArray: groupArray,
        userNameArray: usersArray,
        warn: 2,
        fetched_logs
    })
}


module.exports = {

    loginPage,
    loginUser,
    logout,
    memberinfo,
    findone,
    findall,
    universal,
    getNewUser,
    newUser

}
