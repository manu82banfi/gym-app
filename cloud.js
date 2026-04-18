const BIN_ID = "69dd6027aaba882197f65b6c";
const API_KEY = "$2a$10$O9DeoNpqBSYwuBJUsebAdON/SGrC8KTJ/btm8DGG/LxCTplTcq7LO";

const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// CARICA DAL CLOUD
async function caricaCloud() {
  try {
    const r = await fetch(BASE_URL, {
      headers: { "X-Master-Key": API_KEY }
    });

    const j = await r.json();
    return j.record || [];
  } catch {
    return [];
  }
}

// SALVA NEL CLOUD
async function salvaCloudCloud(data) {
  try {
    const r = await fetch(BASE_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify(data)
    });

    return await r.json();
  } catch (err) {
    console.log("Errore salvataggio cloud:", err);
  }
}

// ESPOSIZIONE GLOBALE
window.caricaCloud = caricaCloud;
window.salvaCloudCloud = salvaCloudCloud;