let schede = [];
let schedaAttivaId = null;

// ======================
// INIT
// ======================
async function init() {
  const cloud = await caricaCloud();
  if (cloud) schede = cloud;

  if (schede.length === 0) {
    nuovaScheda();
  } else {
    schedaAttivaId = schede[0].id;
  }

  render();
}

// ======================
// GET scheda attiva
// ======================
function getSchedaAttiva() {
  return schede.find(s => s.id === schedaAttivaId);
}

// ======================
// RENDER SCHEDA
// ======================
function render() {
  const app = document.getElementById("app");
  const scheda = getSchedaAttiva();
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
// SCHEDA CRUD
// ======================
function nuovaScheda() {
  const nuova = {
    id: Date.now(),
    nome: "Nuova Scheda",
    esercizi: []
  };

  schede.push(nuova);
  schedaAttivaId = nuova.id;
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

        <button onclick="caricaScheda(${s.id})">Apri</button>
        <button onclick="duplicaScheda(${s.id})">Copia</button>
        <button onclick="eliminaScheda(${s.id})">Elimina</button>
      </div>
    `).join("")}
  `;
}

function caricaScheda(id) {
  schedaAttivaId = id;
  render();
}

function eliminaScheda(id) {
  schede = schede.filter(s => s.id !== id);
  if (schedaAttivaId === id && schede.length) {
    schedaAttivaId = schede[0].id;
  }
  render();
}

function duplicaScheda(id) {
  const originale = schede.find(s => s.id === id);

  const copia = {
    ...originale,
    id: Date.now(),
    nome: originale.nome + " (copia)"
  };

  schede.push(copia);
  render();
}

function renameScheda(nome) {
  const s = getSchedaAttiva();
  if (s) s.nome = nome;
}

// ======================
// ESERCIZI
// ======================
function aggiungiEsercizio() {
  const s = getSchedaAttiva();
  s.esercizi.push({
    nome: "Nuovo esercizio",
    serie: [{ reps: 10, kg: 20 }]
  });
  render();
}

function aggiungiSerie(i) {
  const s = getSchedaAttiva();
  s.esercizi[i].serie.push({ reps: 10, kg: 20 });
  render();
}

function updateEsercizio(i, value) {
  getSchedaAttiva().esercizi[i].nome = value;
}

function updateReps(i, j, value) {
  getSchedaAttiva().esercizi[i].serie[j].reps = Number(value);
}

function updateKg(i, j, value) {
  getSchedaAttiva().esercizi[i].serie[j].kg = Number(value);
}

// ======================
// SAVE LOCAL
// ======================
function salvaScheda() {
  localStorage.setItem("schede", JSON.stringify(schede));
  alert("💾 Salvato locale");
}

function caricaLocale() {
  const data = localStorage.getItem("schede");
  if (data) schede = JSON.parse(data);
}

// ======================
window.nuovaScheda = nuovaScheda;
window.apriListaSchede = apriListaSchede;
window.caricaScheda = caricaScheda;
window.eliminaScheda = eliminaScheda;
window.duplicaScheda = duplicaScheda;
window.aggiungiEsercizio = aggiungiEsercizio;
window.aggiungiSerie = aggiungiSerie;
window.updateEsercizio = updateEsercizio;
window.updateReps = updateReps;
window.updateKg = updateKg;
window.salvaScheda = salvaScheda;
window.renameScheda = renameScheda;

// START
caricaLocale();
init();