// Requirements & Constants

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const appName = 'TinyApp';

const bcrypt = require('bcrypt');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const cookieSession = require('cookie-session');
app.use(cookieSession({
  secret:'freddyfrog',
  maxAge: 24 * 60 * 60 * 1000
}));

// const session = require('express-session');
// app.use(session({
//   secret: 'freddyfrog',
//   resave: false,
//   saveUninitialized: true,
//   maxAge: 24 * 60 * 60 * 1000
// }))

// const flash = require('express-flash-messages');
// app.use(flash());


//const ejsLint = require('ejs-lint');
//app.use(ejslint());

app.set("view engine", "ejs")

//
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// User database model
let users = {
  "user3RandomID": {
    id: "user3RandomID",
    email: "hilary@hilarymackey.ca",
    password: "funny-bunny"
  }
};

/* HELPER FUNCTION(S) */

const checkPassword = (emailIn, passwordIn) => {
  if (bcrypt.compareSync(passwordIn, users[getIdByEmail(emailIn)].password)) {
    return true;
  }
  return false;
}

const doesEmailExist = (emailIn) => {
  for(user in users) {
    if (users[user].email === emailIn) {
      return true;
    }
  }
  return false;
};

// Inconsistent capitalization - can't correct here alone without consequences
// Called to generate unique userIDs and shortURLs
function generateRandomString() {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  const string_length = 6;
  let randomstring = '';
  for (let i = 0; i < string_length; i++) {
    let rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum,rnum+1);
  }
  return randomstring;
}

function findUser(username, password){
  for (user in users){
    if (username === users[user].email && bcrypt.compareSync(password, users[user].password)){
      return users[user];
    }
  }
  return undefined;
}

const getEmailById = (userID) => {
  let user = users[userID];
  if (!users) {
    return;
  }
  return user.email;
};

const getIdByEmail = (emailIn) => {
  let id = undefined;
  for(user in users) {
    if (users[user].email === emailIn) {
      id = user;
    }
  }
  return id;
};

/* ROUTES */
/* gets */
app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/login", (req, res) => {
  let loggedIn = Boolean(req.session.userId);
  if(!loggedIn){
    let templateVars = {
      users: {
        id: "",
        email: ""
      }
    };
    res.render("login", templateVars);
    return;
  } else {
    res.redirect("/");
  }
});

app.get("/register", (req, res) => {
  let loggedIn = Boolean(req.session.userId);
  if(loggedIn){
  res.redirect("/urls");
  } else {
    let templateVars = {
      user: {
      id: "",
      email: ""
    }
  };
  res.render("register", templateVars);
  }
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["user_id"] };
  console.log("templateVars:", templateVars);
  //ejslint("urls_index");
  res.render("urls_index", templateVars);
});

// Must precede "urls/:id"
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["user_id"] };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, URL: urlDatabase[req.params.id],
    username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/* posts */
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  //console.log(userID, req.body.email, req.body.password);

  if (email === "" || password === "") {
    let templateVars = {
      message: "Email or Password empty"
    };
    res.render("error", templateVars);
    return;
    res.render("register");
  } else if (1 < 0) {
    // Email address already in users
    // Want to use alert, but console.log for now
    console.log("Sorry,", email, "was already registered");
    res.render("register");
  } else {
    // Add the new user to the users object
    const encryptedPassword = bcrypt.hashSync(req.body.password, 10);
    let userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: email,
      password: encryptedPassword
    };
    // Confirm an addition
    console.log("users:", users);
    req.session.userId = users[userID];
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body["longURL"];
  res.writeHead(301,
  {Location: 'http://localhost:8080/urls/' + shortURL}
  );
  res.end();
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect("/urls");
});

/* Kept for Testing - candidate for removal */
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});


app.listen(PORT, () => {
  console.log(appName, `is listening on port ${PORT}!`);
});