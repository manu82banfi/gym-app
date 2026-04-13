let schede = [];
let schedaAttivaId = null;

// ======================
// INIT SICURO
// ======================
async function init() {
  const local = localStorage.getItem("schede");
  if (local) {
    schede = JSON.parse(local);
  }

  const cloud = await caricaCloud();
  if (cloud && cloud.length > 0) {
    schede = cloud;
  }

  // GARANTISCI ALMENO 1 SCHEDA
  if (schede.length === 0) {
    schede.push({
      id: Date.now(),
      nome: "Nuova Scheda",
      esercizi: []
    });
  }

  schedaAttivaId = schede[0].id;
  render();
}

// ======================
// GET SCHEDA
// ======================
function getScheda() {
  return schede.find(s => s.id === schedaAttivaId);
}

// ======================
// RENDER
// ======================
function render() {
  const app = document.getElementById("app");
  const scheda = getScheda();

  if (!scheda) return;

  app.innerHTML = `
    <h3 contenteditable oninput="renameScheda(this.innerText)">
      ${scheda.nome}
    </h3>
  `;

  scheda.esercizi.forEach((ex, i) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <input value="${ex.nome}"
        onchange="updateEsercizio(${i}, this.value)">

      <div class="serie">
        ${(ex.serie || []).map((s, j) => `
          <div>
            <input type="number" value="${s.reps}"
              onchange="updateReps(${i}, ${j}, this.value)">
            x
            <input type="number" value="${s.kg}"
              onchange="updateKg(${i}, ${j}, this.value)">
          </div>
        `).join("")}
      </div>

      <button onclick="aggiungiSerie(${i})">+ Serie</button>
    `;

    app.appendChild(div);
  });
}

// ======================
// SCHEDA
// ======================
function nuovaScheda() {
  const s = {
    id: Date.now(),
    nome: "Nuova Scheda",
    esercizi: []
  };

  schede.push(s);
  schedaAttivaId = s.id;
  render();
}

function apriListaSchede() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <h3>📋 Schede</h3>
    ${schede.map(s => `
      <div class="card">
        <b>${s.nome}</b>
        <br><br>

        <button onclick="apriScheda(${s.id})">Apri</button>
        <button onclick="duplicaScheda(${s.id})">Copia</button>
        <button onclick="eliminaScheda(${s.id})">Elimina</button>
      </div>
    `).join("")}
  `;
}

function apriScheda(id) {
  schedaAttivaId = id;
  render();
}

function eliminaScheda(id) {
  schede = schede.filter(s => s.id !== id);

  if (schede.length === 0) {
    schede.push({
      id: Date.now(),
      nome: "Nuova Scheda",
      esercizi: []
    });
  }

  schedaAttivaId = schede[0].id;
  render();
}

function duplicaScheda(id) {
  const orig = schede.find(s => s.id === id);

  const copia = {
    ...orig,
    id: Date.now(),
    nome: orig.nome + " (copia)"
  };

  schede.push(copia);
  render();
}

function renameScheda(val) {
  const s = getScheda();
  if (s) s.nome = val;
}

// ======================
// ESERCIZI (FIX CRITICO QUI)
// ======================
function aggiungiEsercizio() {
  const s = getScheda();
  if (!s) return;

  s.esercizi.push({
    nome: "Nuovo esercizio",
    serie: [{ reps: 10, kg: 20 }]
  });

  render();
}

function aggiungiSerie(i) {
  const s = getScheda();
  s.esercizi[i].serie.push({ reps: 10, kg: 20 });
  render();
}

function updateEsercizio(i, val) {
  const s = getScheda();
  s.esercizi[i].nome = val;
}

function updateReps(i, j, val) {
  const s = getScheda();
  s.esercizi[i].serie[j].reps = Number(val);
}

function updateKg(i, j, val) {
  const s = getScheda();
  s.esercizi[i].serie[j].kg = Number(val);
}

// ======================
// SAVE
// ======================
function salvaLocale() {
  localStorage.setItem("schede", JSON.stringify(schede));
  alert("💾 Salvato locale");
}

// ======================
// GLOBAL
// ======================
window.nuovaScheda = nuovaScheda;
window.apriListaSchede = apriListaSchede;
window.apriScheda = apriScheda;
window.eliminaScheda = eliminaScheda;
window.duplicaScheda = duplicaScheda;
window.aggiungiEsercizio = aggiungiEsercizio;
window.aggiungiSerie = aggiungiSerie;
window.updateEsercizio = updateEsercizio;
window.updateReps = updateReps;
window.updateKg = updateKg;
window.salvaLocale = salvaLocale;
window.renameScheda = renameScheda;

// START
init();