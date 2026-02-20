import express from "express"
export let dataSecureRoute = express.Router()

dataSecureRoute.get((""), async (req, res) => {
    const username = req.signedCookies.username || "";
    const img = req.signedCookies.profilePic || "";


    res.render("main/legally/dataSecure.ejs", {
        title: "Datenschutz",
        css: "../css/legally/data_secure.css",
        username: username,
        img: img,
        showBody: true
    })

})

export let impressumRoute = express.Router()

impressumRoute.get((""), async (req, res) => {
    const username = req.signedCookies.username || "";
    const img = req.signedCookies.profilePic || "";


    res.render("main/legally/impressum.ejs", {
        title: "Impressum",
        css: "../css/legally/impressum.css",
        username: username,
        img: img,
        showBody: true
    })

})