/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Nidhi Joshi Student ID: 120402227 Date: 31-10-2023
*
* Published URL: ___________________________________________________________
*
********************************************************************************/


const express = require('express');
const app = express();
const path = require("path");
const legoData = require("./modules/legoSets");
const HTTP_PORT = process.env.PORT || 8080
app.use(express.static("public"));

// Initialize legoData and start the server only when it's resolved successfully
legoData.initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Server is initialized on port http://localhost:${HTTP_PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to initialize legoData:', error);
  });

// Routes

// GET "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "/views/home.html"));
});

// GET "/about"
app.get('/about', (req, res)=>{ 
  res.sendFile(path.join(__dirname, "/views/about.html"));
});

// Updated "/lego/sets" route
app.get('/lego/sets', (req, res) => {
  const theme = req.query.theme;

  if (theme) {
    // If a "theme" query parameter is present, respond with Lego data for that theme
    legoData.getSetsByTheme(theme)
      .then(sets => {
        if (sets.length > 0) {
          res.json(sets);
        } else {
          res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
        }
      })
      .catch(error => {
        res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
      });
  } else {
    // If "theme" query parameter is not present, respond with all unfiltered Lego data
    legoData.getAllSets()
      .then(sets => {
        res.json(sets);
      })
      .catch(error => {
        res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
      });
  }
});

// Update the "/lego/sets/id-demo" route
app.get('/lego/sets/:set_num', (req, res) => {
  const setNum = req.params.set_num; // Extract the set_num from the route parameter

  legoData.getSetByNum(setNum)
    .then(sets => {
      if (sets) {
        res.json(sets);
      } else {
        res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
      }
    })
    .catch(error => {
      res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
    });
});

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "/views/404.html"));
});