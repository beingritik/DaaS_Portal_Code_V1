// const jwt = require('jsonwebtoken');
const express = require('express')
const app = express();
const userModel = require('../models/model');
const cookies = require("cookie-parser");
app.use(cookies());
app.use(express.json());
const jwt = require("jsonwebtoken");
const JWT_KEY = require("../secrets").JWT_KEY



async function rbac(req, res){
    let token;
    if(req.cookies.login){
        token = req.cookies.login
        let payload = await jwt.verify(token, JWT_KEY);
        const username = await userModel.findOne({"username":payload.payload})
        req.role = username.role;
    }
    return req.role   
}
module.exports = rbac;