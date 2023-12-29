module.exports = {
    username:"Harshitg@lntdccspoc.com",
    password:"pass@123",
    JWT_KEY : "qwertyuiop"
}

function findUserName(req, res){
    return req.cookies.username;
}

