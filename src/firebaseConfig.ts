import { initializeApp } from "firebase/app";
import firebase from 'firebase/app'
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
    apiKey: "AIzaSyAYRkiCZ2KuNmWR3JsHCx0hfy2E3FKvvcE",
    authDomain: "my-blog-584c8.firebaseapp.com",
    projectId: "my-blog-584c8",
    storageBucket: "my-blog-584c8.appspot.com",
    messagingSenderId: "764340608227",
    appId: "1:764340608227:web:7f5f934331ee0d8cd279d6",
    measurementId: "G-ZFRDYEDFRP"
  };

const app  = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
const auth = getAuth(app)
const db = getFirestore(app)
const realtime = getDatabase(app)

export { auth, db, realtime, analytics };