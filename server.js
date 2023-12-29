require("dotenv").config()
require("./backend/db/connec");
const express = require("express");
var cookies = require("cookie-parser");
const path = require('path');
var bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");

const JWT_KEY = require("./backend/secrets").JWT_KEY
const userModel = require("./backend/models/model");

// create application/json parser
var jsonParser = bodyParser.json()

const app = express();
app.use(cookies());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(jsonParser);

// this is view engine setup for ejs pages 
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'frontend/views/pages'));

//this is for static things like CSS,JS, HTML
app.use(express.static('frontend/public'))

//Routes (middlewares) for the whole project
app.use('/', require('./backend/Routers/router'));
app.use('/managevdigroup', require('./backend/Routers/managevdigroupRoute'))

// this is to download the CSV file  for all members
app.get('/myteaminfo/downloadCsvall', function (req, res) {
    try {
        // console.log("inner csv is:",csv);
        res.download('./backend/downloads/files/myallteamMembers.csv', function (err) {
            console.log("CSV file downloaded successfully");
            if (!err) {
                const fs = require('fs');
                fs.unlink(`./backend/downloads/files/myallteamMembers.csv`, (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log("Delete File successfully.");
                });

            }
        });
    }
    catch (err) {
        console.log("error in downloading csv in event handler is:", err.message);
    }
});

// this is to download the CSV file  for a particular group
app.get('/managevdigroup/downloadCsv/:userGroup', function (req, res) {
    try {
        group = req.params.userGroup
        console.log(group);
        console.log("Downloadable csv is:", csv);
        res.download(`./backend/downloads/files/${group}.csv`, function (err) {
            console.log("Particular members CSV file downloaded successfully");
            if (!err) {
                const fs = require('fs');
                fs.unlink(`./backend/downloads/files/${group}.csv`, (err) => {
                    if (err) {
                        throw err;
                    }
                    console.log("Delete File successfully.");
                });

            }
        });
    }
    catch (err) {
        console.log("error in downloading csv in event handler is:", err.message);
    }
});

app.use('*', async (req, res) => {
    let token;
    if (req.cookies.login) {
        token = req.cookies.login
        let payload = await jwt.verify(token, JWT_KEY);
        const username = await userModel.findOne({ "username": payload.payload })
        req.role = username.role;
    }
    res.render('404', { role: req.role });
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("Running portal_master on: ", PORT)
})

