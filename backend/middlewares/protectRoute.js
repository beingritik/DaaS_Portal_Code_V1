const express = require("express");
var cookies = require("cookie-parser");
const app = express();
const userModel = require("../models/model")
app.use(cookies());
app.use(express.json());

const {isAdminFunc} = require("../controller/userController")
const jwt = require('jsonwebtoken');

const JWT_KEY = "qwertyuiop";




async function protectRoute(req, res, next) {
    let token;
    if(req.cookies.login) {
        token = req.cookies.login;
        
        // console.log(req);
        let payload = await jwt.verify(token, JWT_KEY);
        
        const username = payload.payload;

        
        if(payload){
            next();
        } 
        else{
            
            return res.redirect('login')
        }
    }
    else{
        return res.redirect('login')
    }

}

module.exports = protectRoute
