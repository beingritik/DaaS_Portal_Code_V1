const app = require('express');
const managevdigroupRoute = app.Router();
const protectRoute = require("../middlewares/protectRoute");
// const {getRemoveUser, postRemoveUser} = require("../controller/removeController")

const userGroupController= require("../controller/userGrpController");
const {isManagerOrAdmin} = require('../controller/isAdmin');

// add controller con

managevdigroupRoute
.get('/',protectRoute, userGroupController.getUsergroupAsList)
.get("/revokeUser/:userGroup", protectRoute, userGroupController.getRemoveUser)
.post("/revokeUser/:userGroup", protectRoute, userGroupController.postRemoveUser)
.get("/:userGroup", protectRoute, userGroupController.getUserGroupMembers) 
.get("/addUser/:userGroup", protectRoute,userGroupController.addmembersPage)
.post("/addUser/:userGroup/added", protectRoute,userGroupController.addinAd)

module.exports = managevdigroupRoute;