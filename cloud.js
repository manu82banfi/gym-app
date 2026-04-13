const BIN_ID = "69dd6027aaba882197f65b6c";
const API_KEY = "$2a$10$O9DeoNpqBSYwuBJUsebAdON/SGrC8KTJ/btm8DGG/LxCTplTcq7LO";

const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

async function salvaSuCloud(data) {
  try {
    await fetch(BASE_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": API_KEY
      },
      body: JSON.stringify(data)
    });

    alert("☁️ Salvato su cloud");
  } catch (err) {
    console.error(err);
    alert("Errore cloud");
  }
}

async function caricaDaCloud() {
  try {
    const res = await fetch(BASE_URL, {
      headers: {
        "X-Master-Key": API_KEY
      }
    });

    const json = await res.json();
    return json.record || null;

  } catch (err) {
    console.error(err);
    return null;
  }
}

// funzione pulsante
async function caricaCloud() {
  const data = await caricaDaCloud();

  if (data) {
    scheda = data;
    render();
    alert("☁️ Caricato da cloud");
  } else {
    alert("Niente dati cloud");
  }
}