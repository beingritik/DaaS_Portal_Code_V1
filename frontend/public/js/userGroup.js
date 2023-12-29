function validation(){
  var user = document.getElementById('usernameField').value;
  
  if(user == ""){
      document.getElementById('username').innerHTML = "**Field must not be empty";
      return false;
  }
  var group = document.getElementById('userGroupField').value;
 
  if(group == ""){
      document.getElementById('userGroup').innerHTML = "**Field must not be empty";
      return false;
  }

  var roles = document.getElementById('userRole');

  if(roles == ""){
      document.getElementById('role').innerHTML = "**Field must not be empty";
      return false;
  }
      
}