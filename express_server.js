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

let user_id = "";

const session = require('express-session');
app.use(session({
  secret: 'freddyfrog',
  resave: false,
  saveUninitialized: true,
  maxAge: 24 * 60 * 60 * 1000
}))

app.set("view engine", "ejs")

// Initial URL Database
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

function checkPassword(emailIn, passwordIn) {
  if (bcrypt.compareSync(passwordIn, users[getIdByEmail(emailIn)].password)) {
    return true;
  }
  return false;
}

function doesEmailExist(emailIn) {
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

function getIdByEmail(emailIn) {
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
  res.end("<html><head><title>TinyApp</title></head><body><h1>TinyApp</h1><p>This is a URL shortening app. <a href='/login'>Login</a>, <a href='/register'>register</a>, or see its README <a href='https://github.com/surgeslc/tinyApp'>here</a>.</body></html>");
});

app.get("/login", (req, res) => {
  let loggedIn = Boolean(req.session.user_id);
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
  let templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"] };
  //console.log("templateVars:", templateVars);
  //ejslint("urls_index");
  res.render("urls_index", templateVars);
});

// Must precede "urls/:id"
app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"] };
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, URL: urlDatabase[req.params.id],
    user_id: req.cookies["user_id"] };
  res.render("urls_show", templateVars);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

/* posts */
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  // Try to match a user to the email submitted.
  // If none's found, return a response with a 403 status code.
  if (!doesEmailExist(email)) {
    // Email address wasn't in users
    res.status(403);
    return res.end("<html><head><title>TinyApp</title></head><body><h1>Error: Email Address Not Found</h1><p>Sorry, no user is registered with that email address. Please <a href='/register'>register</a> or <a href='/login'>login</a>.</body></html>");
  } else if (users[getIdByEmail(email)].password === bcrypt.hashSync(req.body.password, 10)) {
    // Email address was in users; passwords matched
      user_id = users[getIdByEmail(email)];
      let templateVars = { user_id: user_id }
      // Set user_id cookie and redirect
      res.status(200);
      res.cookie("user_id", user_id);
      res.redirect("/");
    } else {
    // Email address was in users, but passwords didn't match
    res.status(400);
    return res.end("<html><head><title>TinyApp</title></head><body><h1>Error: Invalid Input</h1><p>The email/password combination can't be matched to a user. <a href='/register'>Register</a> or <a href='/login'>login</a>.</body></html>");
  }
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (email === "" || password === "") {
    let templateVars = { email: email, password: password };
    // Email and/or Password field was empty
    res.status(400);
    return res.end("<html><head><title>TinyApp</title></head><body><h1>Error: Missing Information</h1><p>Email address and password are both required. <a href='/register'>Register</a> or <a href='/login'>login</a>.</body></html>");
  } else if (doesEmailExist(email)) {
      // Function returned true as email address was already in users
      res.status(400);
      return res.end("<html><head><title>TinyApp</title></head><body><h1>Error: Email Address</h1><p>Sorry, that email address is already registered. Please <a href='/register'>register</a> or <a href='/login'>login</a>.</body></html>\n");
    } else {
      // Add the new user to the users object
      const encryptedPassword = bcrypt.hashSync(req.body.password, 10);
      let user_id = generateRandomString();
      users[user_id] = { id: user_id, email: email, password: encryptedPassword };
      console.log(users);
      let user = users[user_id];
      //user_id = user["id"];
      console.log("user_id:", user_id);

      // Set user_id cookie and redirect
      res.cookie("user_id", user_id);
      let templateVars = { id: user_id, email: email };
      console.log(templateVars);
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
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(appName, `is listening on port ${PORT}!`);
});