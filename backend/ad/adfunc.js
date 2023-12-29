const username = require("../secrets")
const ldap = require('ldapjs');
const secrets = require("../secrets");
const { options } = require("../Routers/router");
const { resolve } = require("path");
const { hasUncaughtExceptionCaptureCallback, allowedNodeEnvironmentFlags } = require("process");

//This is the connection variable to ldap server.
var client = ldap.createClient({
    url: 'ldap://lntdccspoc.com',
    reconnect: true,
    tlsOptions: {
        rejectUnauthorized: true,
    }
});

//Handling the server crash error
client.on('error', function () {
    console.log("4077 error but handled in ADFunc")
})

//Function for unbinding that connected client.
var clientUnbindFunc = async function clientUnbindFunc() {
    try {
        client.unbind(function (err) {
            if (err) {
                console.log("Error in unbinding is:", err)
            }
            else {
                console.log("Client unbinded successfully.");
            }
        })
    }
    catch (err) {
        console.log("The error exception in unbinding the main ldap client is:", err.message);
    }

}

//for establishing the connection
exports.adFunc = function adFunc() {
    try {
        return new Promise((resolve, reject) => {
            client.bind(secrets.username, secrets.password, function (err) {
                if (err) {
                    console.log("Error in new connetion " + err)
                } else {
                    /*if connection is success then go for any operation*/
                    console.log("Success in connection");
                }
            });
            resolve(123);
        })
    }
    catch (err) {
        console.log("The error in establishing connection to AD is:", err.message)
    }
}

//for fetching the memebers from the given  user group fetched from local mongo
exports.fetchGroupUsers = function fetchGroupUsers(mygroup) {
    var teamMemberArray = [];

    return new Promise((resolve, reject) => {
        const group = mygroup;
        var opts = {
            filter: `cn=${group}`, // or search
            scope: 'sub',
            attributes: []
        };
        client.search('CN=Users,DC=lntdccspoc,DC=com', opts, function (err, res) {
            if (err) {
                console.log("Error in search " + err)
                reject();
            } else {
                res.on('searchEntry', function (entry) {

                    if (typeof(entry.object.member) == "undefined") {
                        console.log("1");
                        teamMemberArray = [];
                    } else {
                        // console.log('entry of findall: ' + typeof (entry.object.member));
                        teamMemberArray = entry.object.member;
                    }
                });
                res.on('searchReference', function (referral) {
                    console.log('referral: ' + referral.uris.join());
                });
                res.on('error', function (err) {
                    console.error('error: ' + err.message);
                });
                res.on('end', function (result) {
                    resolve(teamMemberArray);
                    // clientUnbindFunc();
                });
            }
        });

    })
}

// for  fetching  a single user info
//******Here clientUnbindFunc() is not ADDED here in this function to unbind.********
exports.searchUser = function searchUser(user) {
    console.log("the searchuser parameter is :", user)
    return new Promise((resolve, reject) => {
        const name = user;
        var opts = {
            //  filter: '(objectClass=*)',  //simple search
            //  filter: '(&(uid=2)(sn=John))',// and search
            filter: `sAMAccountName=${name}`, // or search
            scope: 'sub',
            attributes: ['cn', 'lastLogonTimestamp', 'telephoneNumber', 'memberOf', 'sAMAccountName', 'userPrincipalName', 'mail', 'dn']
        };
        client.search('CN=Users,DC=lntdccspoc,DC=com', opts, function (err, res) {
            if (err) {
                console.log("Error in search " + err)
                reject();
            } else {
                res.on('searchEntry', function (entry) {
                    info = entry.object;
                    resolve(info);
                });
                res.on('searchReference', function (referral) {
                    console.log('referral: ' + referral.uris.join());
                });
                res.on('error', function (err) {
                    console.error('error: ' + err.message);
                });
                res.on('end', function (result) {
                    console.log('status: ' + result.status);

                    // for  fetching  a single user info
                    //******Here clientUnbindFunc() is not ADDED here in this function to unbind.********
                    exports.searchUser = function searchUser(user) {
                        console.log("the searchuser parameter is :", user)
                        return new Promise((resolve, reject) => {
                            const name = user;
                            var opts = {
                                //  filter: '(objectClass=*)',  //simple search
                                //  filter: '(&(uid=2)(sn=John))',// and search
                                filter: `sAMAccountName=${name}`, // or search
                                scope: 'sub',
                                attributes: ['cn', 'lastLogonTimestamp', 'telephoneNumber', 'memberOf', 'sAMAccountName', 'userPrincipalName', 'mail', 'dn']
                            };
                            client.search('CN=Users,DC=lntdccspoc,DC=com', opts, function (err, res) {
                                if (err) {
                                    console.log("Error in search " + err)
                                    reject();
                                } else {
                                    res.on('searchEntry', function (entry) {
                                        
                                        info = entry.object;
                                        resolve(info);
                                    });
                                    res.on('searchReference', function (referral) {
                                        console.log('referral: ' + referral.uris.join());
                                    });
                                    res.on('error', function (err) {
                                        console.error('error: ' + err.message);
                                    });
                                    res.on('end', function (result) {
                                        console.log('status: ' + result.status);
                                        //******Here clientUnbindFunc() is not ADDED here in this function to unbind.********
                                    });
                                }
                            });
                        });
                    }
                });
            }
        });
    });
}

// for  fetching  a single member info 
exports.searchMember = function searchMember(user) {
    return new Promise((resolve, reject) => {
        const name = user;
        // console.log("the parameter in searchmember is:", name);
        var opts = {
            //  filter: '(objectClass=*)',  //simple search
            //  filter: '(&(uid=2)(sn=John))',// and search
            filter: `cn=${name}`, // or search
            scope: 'sub',
            attributes: ['cn', 'lastLogonTimestamp', 'telephoneNumber'/*, 'memberOf', 'primaryGroupID'*/, 'sAMAccountName', 'userPrincipalName', 'mail']
        };
        client.search('CN=Users,DC=lntdccspoc,DC=com', opts, function (err, res) {
            // console.log("the parameter in searchmember inner search function is:", name);
            if (err) {
                console.log("Error in search " + err)
                reject();
            } else {
                res.on('searchEntry', function (entry) {
                    memberinfo = entry.object;
                    // console.log("the info variable is :", memberinfo)
                    resolve(memberinfo);
                });
                res.on('searchReference', function (referral) {
                    console.log('referral: ' + referral.uris.join());
                });
                res.on('error', function (err) {
                    console.error('error: ' + err.message);
                });
                res.on('end', function (result) {
                    console.log('status: ' + result.status);
                    clientUnbindFunc();
                });
            }
        });
    });
}

//Function for fetching member Array info.
exports.memberArrayInfo = function memberArrayInfo(user) {
    return new Promise((resolve, reject) => {
        const name = user;
        // console.log("the parameter in searchmember is:", name);
        var opts = {
            //  filter: '(objectClass=*)',  //simple search
            //  filter: '(&(uid=2)(sn=John))',// and search
            filter: `cn=${name}`, // or search
            scope: 'sub',
            attributes: ['cn', 'lastLogonTimestamp', 'telephoneNumber'/*, 'memberOf', 'primaryGroupID'*/, 'sAMAccountName', 'userPrincipalName', 'mail']
        };
        client.search('CN=Users,DC=lntdccspoc,DC=com', opts, function (err, res) {
            // console.log("the parameter in searchmember inner search function is:", name);
            if (err) {
                console.log("Error in search " + err)
            } else {
                res.on('searchEntry', function (entry) {
                    memberinfo = entry.object
                    // console.log("the info variable is :", memberinfo)
                    resolve(memberinfo);
                });
                res.on('searchReference', function (referral) {
                    console.log('referral: ' + referral.uris.join());
                });
                res.on('error', function (err) {
                    console.error('error: ' + err.message);
                });
                res.on('end', function (result) {
                    console.log('status: ' + result.status);
                    // clientUnbindFunc();
                });
            }
        });
    });
}

//Function for adding user to the group in AD.
exports.useraddtoGroup = function useraddtoGroup(groupName, dn) {
    try {
        return new Promise((resolve, reject) => {
            let flag = 2;
            var groupDn = `CN=${groupName},CN=Users,DC=lntdccspoc,DC=com`;
            var change = new ldap.Change({
                operation: 'add',
                modification: {
                    member: [dn]
                }
            });
            client.modify(groupDn, change, function (err, res) {
                if (err) {
                    console.error("Looks like group add FAILED: %j", err);
                    flag = 0;
                    resolve(flag);
                } else {
                    // console.log("User added successfully in AD: %j", res);
                    console.log("User added successfully in AD.");
                    flag = 1;
                    resolve(flag);
                }
            });
        })

    }
    catch (err) {
        console.log("The exception in adding user to AD is:", err)
    }
}

//Function is deleting user to the group in AD.
let promiseDelete = function (groupDn, change) {
    return new Promise((resolve, reject) => {
        client.modify(groupDn, change, function (err, res) {
            if (err) {
                console.error("Looks like group delete FAILED: %j");
                bool = 0;
            } else {
                console.log("Looks like group delete WORKED: %j");
                bool = 1;
            }
            resolve(bool);
        })
    })
}

exports.delFromGroup = async function delFromGroup(dn, grpdn) {
    var groupDn = `CN=${grpdn},CN=Users,DC=lntdccspoc,DC=com`;
    var change = new ldap.Change({
        operation: 'delete',
        modification: {
            member: [`${dn}`]
        }
    });

    let bool = await promiseDelete(groupDn, change);
    console.log("this is the grp", bool)
    return bool
}

