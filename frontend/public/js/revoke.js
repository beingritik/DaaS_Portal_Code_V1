function validate(){
  var user = document.getElementById('usernameToDelete').value;
  if(user == ""){
      document.getElementById('username').innerHTML = "**Field must not be empty";
      return false;
  }
}