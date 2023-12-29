const app = require('express');
const infoRoute = app.Router();

const service = require('../service/render.js')
const usercontrollerVar= require('../controller/userController.js');
const {isAdmin} = require("../controller/isAdmin");
const protectRoute = require("../middlewares/protectRoute")
const authenticationStep = require('../middlewares/authHelper.js');
const adminController = require("../controller/adminController")


infoRoute
.get('/login', usercontrollerVar.loginPage)
.get('/logout', usercontrollerVar.logout)
.post('/login', authenticationStep,usercontrollerVar.loginUser)    
.get('/',protectRoute,service.homeroute)
.post('/myteaminfo',protectRoute, usercontrollerVar.findall)
.post('/myteaminfo/teammemberinfo',protectRoute,usercontrollerVar.memberinfo)
.post('/myinfo',protectRoute, usercontrollerVar.findone)
.post('/managevdigroup/memberinfo',protectRoute,usercontrollerVar.memberinfo)
.get('/admin-dashboard',protectRoute, isAdmin,service.adminroute)
.get('/api',protectRoute, isAdmin, usercontrollerVar.getNewUser)
.post('/api',protectRoute, isAdmin, usercontrollerVar.newUser)
.get('/adminTable',protectRoute, isAdmin, adminController.adminTable)
.post("/adminTable/delete_user/:username",protectRoute, isAdmin, adminController.deleteUserFromDB)
.post("/adminTable/delete_user_group",protectRoute, isAdmin, adminController.delete_usergroup_from_user)
.get('/logs', protectRoute, adminController.all_logs)


module.exports = infoRoute;