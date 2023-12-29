const express = require("express");
const app = express()
var ActiveDirectory = require('activedirectory');
const {username, password} = require('../secrets');
const rbac = require("./rbac");



async function authenticationStep(req, res, next){
    let flag = true;
    const role = await rbac(req, res);
    var config = { url: 'ldap://lntdccspoc.com',
                baseDN: 'dc=lntdccspoc,dc=com',
                username: username,
                password: password
            }
    var ad = new ActiveDirectory(config);
    let data = req.body;
    
    let userName = data.username + "@lntdccspoc.com"
    userName = userName.toLowerCase();
    ad.authenticate(userName, data.password, function(err, auth) {
        if(auth){
            // console.log("auth Helper ",req.body)
            next();
            // console.log("Hii")
        }
        else{
            res.clearCookie("login");
            flag = false;
            res.status(401).render("login", {flag :flag})
        }
    });
}


module.exports = authenticationStep;