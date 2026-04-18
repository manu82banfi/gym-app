const BIN_ID = "69dd6027aaba882197f65b6c";
const API_KEY = "$2a$10$O9DeoNpqBSYwuBJUsebAdON/SGrC8KTJ/btm8DGG/LxCTplTcq7LO";

const BASE_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

async function caricaCloud() {
  const r = await fetch(BASE_URL, {
    headers: { "X-Master-Key": API_KEY }
  });
  const j = await r.json();
  return j.record || [];
}