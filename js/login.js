function validatePassword() {

  const password = document.getElementById("password").value;

  const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordPattern.test(password)) {
    alert("Password must contain:\n8 characters\n1 uppercase\n1 lowercase\n1 number\n1 special symbol");
    return false;
  }

  return true;
}