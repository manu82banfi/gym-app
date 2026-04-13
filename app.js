let scheda = {
  nome: "Scheda",
  esercizi: []
};

// ======================
// RENDER
// ======================
function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  scheda.esercizi.forEach((ex, i) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <input value="${ex.nome}" 
        onchange="updateEsercizioNome(${i}, this.value)">

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
// NUOVA SCHEDA
// ======================
function nuovaScheda() {
  scheda = { nome: "Nuova Scheda", esercizi: [] };
  render();
}

// ======================
// ESERCIZIO
// ======================
function aggiungiEsercizio() {
  scheda.esercizi.push({
    nome: "Nuovo esercizio",
    serie: [{ reps: 10, kg: 20 }]
  });
  render();
}

// ======================
// SERIE
// ======================
function aggiungiSerie(i) {
  scheda.esercizi[i].serie.push({ reps: 10, kg: 20 });
  render();
}

// ======================
// UPDATE
// ======================
function updateEsercizioNome(i, value) {
  scheda.esercizi[i].nome = value;
}

function updateReps(i, j, value) {
  scheda.esercizi[i].serie[j].reps = Number(value);
}

function updateKg(i, j, value) {
  scheda.esercizi[i].serie[j].kg = Number(value);
}

// ======================
// LOCAL SAVE
// ======================
function salvaScheda() {
  localStorage.setItem("scheda", JSON.stringify(scheda));
  alert("Salvata locale!");
}

function caricaLocale() {
  const dati = localStorage.getItem("scheda");
  if (dati) scheda = JSON.parse(dati);
  render();
}

// ======================
// GLOBAL FIX (IMPORTANTISSIMO)
// ======================
window.nuovaScheda = nuovaScheda;
window.aggiungiEsercizio = aggiungiEsercizio;
window.aggiungiSerie = aggiungiSerie;
window.salvaScheda = salvaScheda;
window.updateEsercizioNome = updateEsercizioNome;
window.updateReps = updateReps;
window.updateKg = updateKg;

// START
caricaLocale();