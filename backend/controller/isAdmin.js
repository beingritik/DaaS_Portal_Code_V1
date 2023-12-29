const express = require('express');
const protectRoute = require('../middlewares/protectRoute');
const app = express();
const cookies = require('cookie-parser')
const userModel = require("../models/model")
app.use(cookies());
const jwt = require('jsonwebtoken');
const {JWT_KEY} = require("../secrets")
const { exec } = require("child_process");


async function isAdmin(req, res, next){
   let token;
   if(req.cookies.login){
    token = req.cookies.login;
    let payload = await jwt.verify(token, JWT_KEY);
    const username = await userModel.findOne({"username":payload.payload});
    req.role = username.role;
   }
   
    let userRole = req.role;
    if(userRole == 'admin'){    
        next();
    }
    else{
        return  res.render('404', {role:req.role})
    }
    
}

async function isManagerOrAdmin(req, res, next){
    let token;
    if(req.cookies.login){
     token = req.cookies.login;
     let payload = await jwt.verify(token, JWT_KEY);
     const username = await userModel.findOne({"username":payload.payload});
     req.role = username.role;
    }    
     let userRole = req.role;
     if(userRole == 'admin' || userRole == 'manager'){    
         next();
     }
     else{
         return  res.render('404', {role:req.role})
     }
     
 }

async function isAdminFunc(role){
    // isAdmin()
    let ans;
    console.log(role)
    if(role == "admin"){
        console.log("I am true"+role)
        ans = true;
    }
    else{
        console.log("I am false"+ role)
        ans = false;
    }
    console.log(ans)
    return ans;
}


async function isManagerOrAdminFunc(role){
    // isAdmin()
    let ans;
    console.log(role)
    if(role == "admin" || role == "manager"){
        console.log("I am true"+role)
        ans = true;
    }
    else{
        console.log("I am false"+ role)
        ans = false;
    }
    console.log(ans)
    return ans;
}





module.exports = {isAdmin,isAdminFunc, isManagerOrAdmin, isManagerOrAdminFunc}





