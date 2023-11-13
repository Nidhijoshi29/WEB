/********************************************************************************
* WEB322 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Nidhi Joshi Student ID: 120402227 Date: November 13, 2023
*
* URL Link: 
*
********************************************************************************/

const express = require("express");
const path = require("path");
const app = express();
const HTTP_PORT = 8080;
const legoData = require("./modules/legoSets");
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
legoData
    .initialize()
    .then(async () => {
        app.get('/', (req, res) => {
            res.render("home")
        });
        app.get('/about', (req, res) => {
            res.render("about")
        });
        app.get("/lego/sets", async (req, res) => {
            const theme = req.query.theme;
            if (!theme) {
                legoData.getAllSets()
                    .then((sets) => {
                        res.render("sets", { set: sets });
                    })
                    .catch((error) => {
                        res.status(404).render("404", { message: "Error retrieving Lego sets." });
                    });
            } else {
                legoData.getSetsByTheme(theme)
                    .then((sets) => {
                        res.render("sets", { set: sets });
                    })
                    .catch((error) => {
                        res.status(404).render("404", { message: "Error retrieving Lego sets for the specified theme." });
                    });
            }
        });
        app.get("/lego/sets/:setNum", (req, res) => {
            const setNum = req.params.setNum; 
            legoData
                .getSetByNum(setNum)
                .then((set) => {
                    res.render("set", { set: set });
                })
                .catch((error) => {
                    res.status(404).render("404", { message: error });
                });
        });
        app.use((req, res) => {
            res.status(404).render("404", { message: "I'm sorry, we're unable to find what you're looking for" })
        });
        app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
    })
    .catch((error) => {
        console.error("Error initializing legoData:", error);
    });