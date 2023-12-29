const express = require('express');
var cookies = require('cookie-parser');
const app = express();
const userModel = require('../models/model');
app.use(cookies());
app.use(express.json());




