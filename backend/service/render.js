const express = require("express");
var cookies = require("cookie-parser");
const app = express();
const userModel = require("../models/model")
app.use(cookies());
app.use(express.json());
const {isAdminFunc} = require('../controller/isAdmin')
const jwt = require('jsonwebtoken');
const { JWT_KEY } = require('../secrets');
const rbac = require('../middlewares/rbac');

//This is a index page render by default on login.
exports.homeroute = async (req, res) => {
    // console.log(req)
    
    let role;
    if(req.cookies.login){
        role = await rbac(req, res)
        // console.log(role);
    }
    else{
        res.render('login')
    }
    
    res.render('index' , 
    {
        role : role,
        flag :1,
        isAdminFunc:isAdminFunc
    }
    )
}

//This is just a simple function of rendering of admin route for displaying the admin dashboard boxes. 
exports.adminroute = async(req,res)=>{
    res.render('admin-dashboard');
}
