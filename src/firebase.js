import dotenv from "dotenv";
dotenv.config({ path: './src/.env' })

import { initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, doc, setDoc, getDoc, updateDoc, deleteField } from "firebase/firestore"

const firebaseConfig = {
    apiKey: process.env.FIRE_API_KEY,
    authDomain: process.env.FIRE_AUTH_DOMAIN,
    projectId: process.env.FIRE_PROJECT_ID,
    storageBucket: process.env.FIRE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIRE_MESSAGING_SENDER_ID,
    appId: process.env.FIRE_APP_ID,
    measurementId: process.env.FIRE_MEASUREMENT_ID
};

let app;
let FirestoreDb;

export function InitializeFirebaseApp() {
    try {
        app = initializeApp(firebaseConfig);
        FirestoreDb = getFirestore();
    } catch (error) {

    }
}

// save Data in DB

export async function saveData(collection, username, id, data) {
    const document = doc(FirestoreDb, collection, username.toLowerCase() + " " + id)
    let dataUpdated = await setDoc(document, data)
    return dataUpdated;
}

// load Data from DB

export async function getData(collectionP, username, id) {
    const docRef = doc(FirestoreDb, collectionP, username.toLowerCase() + " " + id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
        return docSnap.data();
    }
    else {
        return false;
    }
}

export async function getDataForServerStart(collectionP) {
    const obj = {}
    let counter = 0
    const snapshot = await getDocs(collection(FirestoreDb, collectionP))
    snapshot.forEach(doc => {
        const key = doc.id
        const words = key.split(" ")
        let idString = words[1]
        let nameString = words[0]
        //state
        let state = doc.data()

        Object.assign(obj, {
            [counter]: {
                userID: idString,
                username: nameString,
                state
            }
        })
        counter += 1
    });
    return obj
}

// delete Data from DB

export async function deleteData(collectionP, username, id, cmd) {
    const docRef = doc(FirestoreDb, collectionP,username.toLowerCase() + " " + id)
    await updateDoc(docRef, {
        [cmd]: deleteField()
    })
}

export const getFirebaseApp = () => app;