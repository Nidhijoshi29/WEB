/********************************************************************************
*  WEB322 – Assignment 06
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
*  Name: -Nidhi Joshi Student ID: 120402227 Date: December 06, 2023
*
*  Published URL: 
*
********************************************************************************/

const express = require('express');
const app = express();
const path = require("path");
const legoData = require("./modules/legoSets");
const HTTP_PORT = process.env.PORT || 8080

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); // Add this line for form data parsing
const authData = require('./modules/auth-service');
const clientSessions = require('client-sessions');

app.use(
  clientSessions({
    cookieName: 'session', 
    secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr', 
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60, 
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});


function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}


// Routes

// GET "/"
app.get('/', (req, res) => {
  res.render("home");
});

// GET "/about"
app.get('/about', (req, res)=>{ 
  res.render("about");
});

// Updated "/lego/sets" route
app.get("/lego/sets", async (req, res) => {
  const theme = req.query.theme;

  try {
    const sets = theme ? await legoData.getSetsByTheme(theme) : await legoData.getAllSets();

    if (sets.length === 0) {
      res.status(404).render("404", { message: "No sets found for a matching theme" });
    } else {
      res.render("sets", { sets });
    }
  } catch (error) {
    res.render("500", { message: `The server encountered an error and could not complete your request.` });
  }
});

app.get("/lego/sets/:set_num", async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.set_num);

    if (set) {
      res.render("set", { set });
    } else {
      res.status(404).render("404", { message: "The requested Lego set was not found" });
    }
  } catch (error) {
    res.render("500", { message: `The server encountered an error and could not complete your request.` });
  }
});


// Render the addSet form
app.get("/lego/addSet",ensureLogin, async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render("addSet", { themes });
  } catch (err) {
    res.render("404", { message: `Error: ${err.message}` });
  }
});

// Handle the submission of the addSet form
app.post('/lego/addSet', ensureLogin, async (req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    await legoData.addSet(req.body);
    res.redirect('/lego/sets');
  } catch (err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

// Render the editSet form
app.get("/lego/editSet/:set_num",ensureLogin, async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.set_num);
    const themes = await legoData.getAllThemes();

    res.render("editSet", { themes, set });
  } catch (err) {
    res.status(404).render("404", { message: `Error: ${err}` });
  }
});

// Handle the submission of the editSet form
app.post('/lego/editSet',ensureLogin, async (req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect('/lego/sets');
  } catch (err) {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/lego/deleteSet/:set_num",ensureLogin, async (req, res) => {
  try {
    await legoData.deleteSet(req.params.set_num);
    res.redirect('/lego/sets');
  } catch (err) {
    res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/login",(req,res)=>{
  res.render('login');
});

app.get("/register",(req,res)=>{
  res.render('register');
});

app.post("/register", (req, res) => {
  authData.registerUser(req.body)
    .then(() => {
      res.render('register', { successMessage: "User created" });
    })
    .catch((err) => {
      res.render('register', { errorMessage: err.message, userName: req.body.userName });
    });
});

app.post("/login",(req, res) => {
  req.body.userAgent = req.get('User-Agent');

  authData
  .checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory,
      };
      res.redirect('/lego/sets');
    })
    .catch((err) => {
      res.render('login', { errorMessage: err.message, userName: req.body.userName });
    });
});
  
app.get("/logout",ensureLogin,(req,res)=>{
  req.session.reset();
  res.redirect('/');
});

app.get("/userHistory",ensureLogin, (req,res)=>{
  res.render('userHistory');
});

app.use((req, res, next) => {
  res.status(404).render("404", 
  {message: `The requested URL cannot be reached by this server. Please check your URL to try again or try after some time. 
  If this issue persists try using it on different browsers. Otherwise this URL does not exist.`});
});

// Custom error handling middleware for internal server errors
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.status === 404) {
    // Render the 404 view
    res.status(404).render("404", { message: `The requested URL cannot be reached by this server. Please check your URL to try again or try after some time. 
    If this issue persists try using it on different browsers. Otherwise this URL does not exist.` });
  } else {
    // Render the 500 view for other errors
    res.render("500", { message: `The server encountered an error and could not complete your request. If the problem persists, please 
    report your problem and mention this error message and the query that caused it.` });
  }
});

async function startServer() {
  try {
    await legoData.initialize();
    await authData.Initialize();
    app.listen(HTTP_PORT, () => console.log(`Server is initialized on port http://localhost:${HTTP_PORT}`));
  } catch (error) {
    console.log(error);
  }
}

startServer();