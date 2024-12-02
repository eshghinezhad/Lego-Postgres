/********************************************************************************
* WEB700 – Assignment 06
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
* 
* Name: Monireh Eshghinezhad      Student ID: 150705234    Date: November 15, 2024.
* Published URL: https://lego-postgres-env.vercel.app//

********************************************************************************/
const express = require("express");
const app = express();

const LegoData = require("./modules/legoSets");
const legoData = new LegoData();

const path = require("path");

 app.set('view engine', 'ejs');
 app.set('views', __dirname + '/views'); 

app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({extended:true}));

const HTTP_PORT = process.env.PORT || 8080;
//------------- Route Handlers-------------

app.get("/", (req,res)=>{
     res.render("home");
});
     //----------------------------------
app.get("/about", (req,res)=>{
     res.render("about");
});
     //----------------------------------
app.get("/lego/sets", (req,res)=>{
    if (req.query.theme) { 
        legoData.getSetsByTheme(req.query.theme) 
        .then(foundSets => {
            res.render("sets", { sets: foundSets }); 
        })
        .catch(err => res.status(404).render("404", {message: err}));       
    } else {       
        legoData.getAllSets()
        .then(legoSets => {
            res.render("sets", { sets: legoSets }); 
        })
        .catch(err => res.status(404).render("404", {message: err})); 
    }  
});
    //-------------------------------------
app.get("/lego/sets/:set_num", (req,res)=>{
    legoData.getSetByNum(req.params.set_num)
        .then(legoSet  =>  res.render("set", {set: legoSet}))
        .catch(err => res.status(404).render("404", {message: err}));
});
    //-------------------------------------
app.get("/lego/addSet", (req,res)=>{       
    legoData.getAllThemes()
    .then(themes => {
        res.render("addSet", { themes });
    })
    .catch(err => res.status(500).render("500", {message: err}));
});
    //-------------------------------
app.post("/lego/addSet", async (req, res) => {
    legoData.addSet(req.body).then(() => {
        res.redirect("/lego/sets");
    })
    .catch(err =>
        res.status(500).render("500", {message: err}));
});
    //-------------------------------
app.get("/lego/deleteSet/:set_num", async (req, res) => {
    legoData
        .deleteSetByNum(req.params.set_num)
        .then(() => {
            res.redirect("/lego/sets");
        })
        .catch(err => res.status(404).render("404", {message: err}));
});
 //------------- Error Handlers-------------
 app.use((req, res) => {
    res.status(404).render("404");
});
//------------------- Server ----------------------------
legoData.initialize()
    .then(() => {
        app.listen(HTTP_PORT, ()=>
            console.log(`server listening on: ${HTTP_PORT}`)); 
    })
    .catch (err =>console.error("Initialization failed:", err));

