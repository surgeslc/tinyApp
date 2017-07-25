// Requirements & Uses

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

const bcrypt = require('bcrypt');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const cookieSession = require('cookie-session');
app.use(cookieSession({
  userId: 'session',
  keys: ['freddy', 'frog']
}));

//const ejsLint = require('ejs-lint');
//app.use(ejslint());

app.set("view engine", "ejs")

//
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//console.log(urlDatabase);

const users = {
  "user3RandomID": {
    id: "user3RandomID",
    email: "hilary@hilarymackey.ca",
    password: "funny-bunny"
  },
  "user4RandomID": {
    id: "user4RandomID",
    email: "lawrence@lawrencesurges.ca",
    password: bcrypt.hashSync("funny-bunny", 10)
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

app.get("/register", (req, res) => {
  if (req.session.userId) {
    res.redirect("/urls");
    return;
  } else {
    let userEmail = getEmailById(req.session.userId);
    let templateVars = { userEmail: userEmail };
    res.render("register", templateVars);
  }
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  console.log("templateVars:", templateVars);
  //ejslint("urls_index");
  res.render("urls_index", templateVars);
});

// Must precede "urls/:id"
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
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
app.post("/login", (req, res) => {
  let username = req.body.username;
  let templateVars = {
    username: username
    // ... any other vars
  };
  res.cookie("username", username);
  res.redirect("/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if ((email = "") || (password = "")) {
    alert("Email address and password are required");
    res.render("/register");
  } else if (Object.values(users).indexOf(req.body.email) > -1) {
    // Email address is already in users
    alert("Sorry,", email, "was registered by another user");
    res.render("/register");
  } else {
    users[userID] = {id: userID, email: email, password: password};
    let templateVars = {username: req.cookies["username"] };
    console.log("templateVars:", templateVars);
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
  console.log(`TinyApp is listening on port ${PORT}!`);
});