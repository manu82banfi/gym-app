const BIN_ID = "69dd6027aaba882197f65b6c";
const API_KEY = "$2a$10$O9DeoNpqBSYwuBJUsebAdON/SGrC8KTJ/btm8DGG/LxCTplTcq7LO";

const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// SALVA TUTTE LE SCHEDE
async function salvaCloud() {
  try {
    await fetch(BASE_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify(schede)
    });

    alert("☁️ Salvato su cloud");
  } catch (e) {
    alert("Errore cloud");
  }
}

// CARICA TUTTE LE SCHEDE
async function caricaCloud() {
  try {
    const res = await fetch(BASE_URL, {
      headers: { "X-Master-Key": API_KEY }
    });

    const json = await res.json();
    return json.record || [];
  } catch (e) {
    return [];
  }
}