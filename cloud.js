const BIN_ID = "69dd6027aaba882197f65b6c";
const API_KEY = "$2a$10$O9DeoNpqBSYwuBJUsebAdON/SGrC8KTJ/btm8DGG/LxCTplTcq7LO";

const URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

async function salvaCloud() {
  try {
    await fetch(URL, {
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

async function caricaCloud() {
  try {
    const res = await fetch(URL, {
      headers: { "X-Master-Key": API_KEY }
    });

    const json = await res.json();
    return json.record || [];
  } catch (e) {
    return [];
  }
}