// User database model
let users = {
  "lawrence": {
    id: "lawrence",
    email: "surgeslc@gmail.com"
  }
};

function doesEmailExist(emailIn) => {
  for(user in users) {
    if (users[user].email === emailIn) {
      return true;
    }
  }
  return false;
};

console.log("Checking Hilary's email address");

doesEmailExist("hilary@hilarymackey.ca");

console.log("Checking Lawrence's email address");

doesEmailExist("surgeslc@gmail.com");

