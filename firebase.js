
// ⚠️ devi creare progetto Firebase e incollare config

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX",
  projectId: "XXX",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ======================
// 💾 SALVA CLOUD
// ======================

window.salvaSuCloud = async function (data) {
  await setDoc(doc(db, "gym", "scheda"), {
    data: JSON.stringify(data),
    updated: Date.now()
  });
};

// ======================
// 📥 CARICA CLOUD
// ======================

window.caricaDaCloud = async function () {
  const snap = await getDoc(doc(db, "gym", "scheda"));

  if (snap.exists()) {
    return JSON.parse(snap.data().data);
  }

  return null;
};