// 1. Validation FUNCTIONS FOR PERFORMING VALIDATION ON add user form.
function seterror(id, error) {
    element = document.getElementById(id);
    element.getElementsByClassName('ferror')[0].innerHTML = error;
}
function validateSelectField() {
    var flag = true;
    var selectField = document.forms['addUserform']["selectuserName"].value;
    console.log("the value is:", selectField);
    if (selectField == "") {
        seterror("adduser", "UserName must not be empty.");
        flag = false;
    }
    else {
        seterror("adduser", " ");
    }
    return flag;
}
function validateForm() {
    var flag_1;
    var flag = true;
    flag_1 = validateSelectField();
    if (flag_1 == false) {
        flag = false;
    }
    return flag;
}
//////////  1.   /////




