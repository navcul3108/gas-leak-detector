const admin = require("firebase-admin");
const serviceAccount = require("../gas-leak-detector-30b89-firebase-adminsdk-jn9ed-7ba8b46009.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const userRef = db.collection("users");

module.exports = userRef;
