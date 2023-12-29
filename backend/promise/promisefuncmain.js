const express = require('express');
const app = express();
const userModel = require("../models/model");
const cookies = require("cookie-parser");
app.use(cookies());
app.use(express.json());
const { exec } = require("child_process");

//this function is called in addMembersPagePromise function.
let addmembersPagePromiseFunc = new Promise((resolve, reject) => {
    let allUsers = [];
    try {
        exec(`( Get-ADUser -Filter *).SamAccountName`, { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
            if (error) {
                console.log(`error in exec command in addmembersPage are: ${error.message}`);
                reject();
            }
            else if (stderr) {
                console.log(`stderr: JSON.Parse(${stderr})`);
                reject();
            }
            // stdout.split(/\r?\n/);
            allUsers = stdout.split(/\r?\n/);
            for (var i=0;i<allUsers.length;i++){
                allUsers[i]=allUsers[i].toLowerCase();
            }
            // console.log("the allusers--1 are:", allUsers);
            resolve(allUsers);
        })
    }
    catch (err) {
        console.log("the error in function addmembersPage is:", err.message);
    }
})

// to get the list of users for a particular Group
let promiseUsers =(userGroup)=> new Promise(function (resolve, reject) {
    let usersList = [];
    exec(`(Get-ADGroupMember -Identity "${userGroup}").SamAccountName`, { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
        // do whatever with stdout
        if (error) {
            console.log(`error in promiseusers is: ${error.message}`);
            reject();
            return;
        }
        if (stderr) {
            console.log(`stderr in promiseusers is: JSON.Parse(${stderr})`);
            return;
        }
        usersList = stdout.split(/\r?\n/);
        for(var i = 0; i<usersList.length; i++){
            usersList[i] = usersList[i].toLowerCase();
        }
        resolve(usersList);
    })
})

// this promise returns userGroups 

let promiseUserGroup = new Promise(function (resolve, reject) {
    let userGroupList = [];
    exec(`( Get-ADGroup -Filter *).Name`, { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
        // do whatever with stdout
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: JSON.Parse(${stderr})`);
            return;
        }
        userGroupList = stdout.split(/\r?\n/);
        resolve(userGroupList)
    })
})

// All users list
let promiseAllUsers = new Promise(function (resolve, reject) {
    let usersList = [];
    exec(`( Get-ADUser -Filter *).SamAccountName`, { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
        // do whatever with stdout
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: JSON.Parse(${stderr})`);
            return;
        }
        usersList = stdout.split(/\r?\n/);
        resolve(usersList)
    })
})

module.exports ={
    addmembersPagePromiseFunc,
    promiseUsers,
    promiseAllUsers,
    promiseUserGroup
}