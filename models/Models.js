const admin = require("firebase-admin");
const serviceAccount = require("../gas-leak-detector-30b89-firebase-adminsdk-jn9ed-7ba8b46009.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const User = db.collection("users");
const Alarm = db.collection("alarm")
const Temperature = db.collection("temperatue");

const addNewAlarm = async(userEmail, data={}, timestamp=new Date())=>{
  if(!userEmail)
    return false
  if((await User.where("email", "==", userEmail).get()).empty)
    return false
  Alarm.add({
    userEmail,
    timestamp,
    ...data
  })
  return true
}
module.exports = {Temperature, User, Alarm, addNewAlarm};
