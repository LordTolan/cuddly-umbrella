const admin = require('firebase-admin');
const config = require('./index');

let firebaseApp;

function initFirebase() {
  if (firebaseApp) return firebaseApp;

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey,
    }),
  });

  return firebaseApp;
}

function getAuth() {
  if (!firebaseApp) initFirebase();
  return admin.auth();
}

module.exports = { initFirebase, getAuth };
