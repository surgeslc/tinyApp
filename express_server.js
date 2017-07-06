var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "hilary@hilarymackey.ca",
    password: "funny-bunny"
  },
  "user4RandomID": {
    id: "user4RandomID",
    email: "lawrence@lawrencesurges.ca",
    password: "funny-bunny"
  }
};

function generateRandomString() {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  var string_length = 6;
  var randomstring = '';
  for (var i=0; i<string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum,rnum+1);
  }
  //console.log(randomstring);
  return randomstring;
}
//generateRandomString();

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/register", (req, res) => {
  //let templateVars = { urls: urlDatabase };
  //console.log(templateVars);
  res.render("register");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  //console.log(templateVars);
  res.render("urls_index", templateVars);
});

// Must be read before "urls/:id"
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  //console.log("shortURL:", shortURL);
  let longURL = urlDatabase[shortURL];
    //if (longURL = undefined)
      //res.redirect('http://localhost:8080/urls');
  //console.log("longURL:", longURL);
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, URL: urlDatabase[req.params.id] };
  // console.log("urls/:id:", templateVars);
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  users[userID] = {id: userID, email: email, password: password};
  console.log(users);
  //console.log("req.body:", req.body);
  //console.log("userID:",userID);
  //console.log("email:", email);
  //console.log("password:", password);
  // urlDatabase[shortURL] = req.body["longURL"];
  //console.log(urlDatabase);
  //res.status(301);
  //res.send("Redirecting to http://localhost:8080/urls/" + shortURL);
  res.writeHead(301,
  {Location: 'http://localhost:8080/urls/'}
  );
  res.end();
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  //console.log("Short:",shortURL);  // debug statement to see POST parameters
  //console.log("Long:", req.body.longURL);
  urlDatabase[shortURL] = req.body["longURL"];
  //console.log(urlDatabase);
  //res.status(301);
  //res.send("Redirecting to http://localhost:8080/urls/" + shortURL);
  res.writeHead(301,
  {Location: 'http://localhost:8080/urls/' + shortURL}
  );
  res.end();
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});