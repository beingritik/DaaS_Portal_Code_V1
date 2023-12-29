function seterror(id, error) {
    element = document.getElementById(id);
    element.getElementsByClassName('ferror')[0].innerHTML = error;
}

function validateUserName() {
    var flag = true;
    var uname = document.forms['loginform']["username"].value;
    uname = uname.trim();
    if (!uname) {
        seterror("uname", "Username must not be empty");
        flag = false;
    }
else {
        seterror("uname", "");
        console.log("outside");
    }
    return flag;
}

function validateUserPassword() {
    var flag = true;

    // console.log("validate password");
    var upass = document.forms['loginform']["password"].value;
    if (!upass) {
        seterror("pass", "Password must not be empty");
        flag = false;
    }
    else {
        seterror("pass", "");
    }
    return flag;
}

function validateForm() {
    var flag = true;
    var flag_1 = validateUserName();
    var flag_2 = validateUserPassword();
    if (flag_1 == false || flag_2 == false) {
        flag = false;
    }
    return flag;
}
