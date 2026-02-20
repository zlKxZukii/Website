import express from "express"
import { getData } from "../src/firebase.js"
export let listRoute = express.Router()

listRoute.get((""), async (req, res) => {
    const { broadcaster, id } = req.query
    const obj = {
        title: `Befehle von ${broadcaster}`,
        css: "../css/list/list.css",
        showBody: true,
        streamer: broadcaster
    }
    const data = await getListData(broadcaster, id)
    Object.assign(obj, { list: data })
    res.render("main/list/list.ejs", obj)
})

async function getListData(broadcaster, id) {
    const obj = {}
    const collectionArr = ["commands", "customCommands", "jokes"]
    // DB eingriff
    for (let index = 0; index < collectionArr.length; index++) {
        const ident = collectionArr[index]
        const data = await getData(collectionArr[index], broadcaster, id)
        const dataKey = Object.keys(data)
        // erstellen des obj wenn der command aktiv ist
        for (let index = 0; index < dataKey.length; index++) {
            if (data[dataKey[index]].state === true || data[dataKey[index]].state === "true") {
                if (ident === "commands") {
                    Object.assign(obj, {
                        [dataKey[index]]: {
                            title: dataKey[index] + " Link",
                            trigger: data[dataKey[index]].trigger
                        }

                    })
                }
                else if (ident === "jokes") {
                    Object.assign(obj, {
                        [dataKey[index]]: {
                            title: dataKey[index] + " Witze",
                            trigger: data[dataKey[index]].trigger
                        }
                    })
                }
                else {
                    Object.assign(obj, {
                        [dataKey[index]]: {
                            title: dataKey[index],
                            trigger: data[dataKey[index]].trigger
                        }
                    })
                }
            }
        }
    }
    Object.assign(obj, {
        clip: {
            title: "Erstellt automatisch einen Clip",
            trigger: "!clip"
        }
    })
    return obj
}