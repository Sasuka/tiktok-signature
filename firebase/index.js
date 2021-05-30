
const admin = require("firebase-admin");

const serviceAccount = require("./tiktok-service.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://tiktok-635bd-default-rtdb.firebaseio.com",
    databaseAuthVariableOverride: {
        uid: "admin-comment"
    }
});
const db = admin.database();
const ref = db.ref("track-comment");
ref.on("value", function(snapshot) {
    console.log(snapshot.val());
});
