
// ======================
// 🧠 STATO APP
// ======================

let scheda = {
  nome: "Scheda",
  esercizi: []
};

// ======================
// 💾 LOCAL + CLOUD SYNC
// ======================

function salvaLocale() {
  localStorage.setItem("scheda", JSON.stringify(scheda));
}

async function salvaCloud() {
  if (window.salvaSuCloud) {
    await salvaSuCloud(scheda);
  }
}

// sync completo
async function salva() {
  salvaLocale();
  await salvaCloud();
}

// ======================
// 🎨 RENDER UI
// ======================

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  scheda.esercizi.forEach((ex, i) => {

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <input value="${ex.nome}" 
        onchange="aggiornaNome(${i}, this.value)">

      <div class="serie">
        ${ex.serie.map((s, j) => `
          <div>
            <input type="number" value="${s.reps}"
              onchange="aggiornaReps(${i}, ${j}, this.value)">
            x
            <input type="number" value="${s.kg}"
              onchange="aggiornaKg(${i}, ${j}, this.value)">
          </div>
        `).join("")}
      </div>

      <button onclick="aggiungiSerie(${i})">+ Serie</button>
      <button onclick="elimina(${i})">🗑</button>
    `;

    app.appendChild(div);
  });
}

// ======================
// ✏️ UPDATE DATI
// ======================

function aggiornaNome(i, v) {
  scheda.esercizi[i].nome = v;
  salva();
}

function aggiornaReps(i, j, v) {
  scheda.esercizi[i].serie[j].reps = Number(v);
  salva();
}

function aggiornaKg(i, j, v) {
  scheda.esercizi[i].serie[j].kg = Number(v);
  salva();
}

// ======================
// ➕ AZIONI
// ======================

function nuovaScheda() {
  scheda = { nome: "Nuova Scheda", esercizi: [] };
  salva();
  render();
}

function aggiungiEsercizio() {
  scheda.esercizi.push({
    nome: "Esercizio",
    serie: [{ reps: 10, kg: 20 }]
  });

  salva();
  render();
}

function aggiungiSerie(i) {
  scheda.esercizi[i].serie.push({ reps: 10, kg: 20 });
  salva();
  render();
}

function elimina(i) {
  scheda.esercizi.splice(i, 1);
  salva();
  render();
}

// ======================
// 📥 LOAD (LOCAL + CLOUD MERGE)
// ======================

async function init() {

  // 1. localStorage
  const local = localStorage.getItem("scheda");

  if (local) {
    scheda = JSON.parse(local);
  }

  // 2. cloud (override se più recente)
  if (window.caricaDaCloud) {
    const cloud = await caricaDaCloud();
    if (cloud) scheda = cloud;
  }

  render();
}

init();
