import express from "express"
export const adsRoute = express.Router()

adsRoute.get("/:key", async (req, res) => {
    const key = req.params.key
    const adsObj = {
        title: "OBS DOCK ADS",
        css: "/css/obs_docks/ads/ads.css",
        showBody: false,
        targetUser: key
    };
    res.render("main/obs_docks/ads/ads.ejs", adsObj)
})