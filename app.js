let schede = [];
let schedaAttiva = null;
let tipoRigaSelezionata = "exercise";

// ======================
// INIT
// ======================
async function init() {
  const local = localStorage.getItem("schede");
  if (local) schede = JSON.parse(local);

  const cloud = await caricaCloud();
  if (cloud && cloud.length) schede = cloud;

  if (!schede.length) nuovaScheda();
  else schedaAttiva = schede[0].id;

  render();
  autosyncLoop();
}

// ======================
// GET SCHEDA
// ======================
function getScheda() {
  return schede.find(s => s.id === schedaAttiva);
}

// ======================
// RENDER
// ======================
function render() {
  const app = document.getElementById("app");
  const s = getScheda();
  if (!s) return;

  app.innerHTML = `
    <h3 contenteditable oninput="renameScheda(this.innerText)">
      ${s.nome}
    </h3>
  `;

  s.righe.forEach((r, i) => {
    const div = document.createElement("div");
    div.className = "card";

    if (r.type === "header") {
      div.innerHTML = `
        <b>HEADER COLONNE</b>
        <div class="grid header">
          <div>ESERCIZIO</div>
          <div>SERIE</div>
          <div>REP-RANGE</div>
          <div>KG</div>
          <div>REC.</div>
          <div>NOTE / PROG.</div>
        </div>
      `;
    }

    if (r.type === "exercise") {
      div.innerHTML = `
        <div class="grid">
          <input value="${r.nome}" onchange="updEx(${i},this.value)">
          <input value="${r.serie}" onchange="upd(i,'serie',this.value)">
          <input value="${r.repRange}" onchange="upd(i,'repRange',this.value)">
          <input value="${r.kg}" onchange="upd(i,'kg',this.value)">
          <input value="${r.rec}" onchange="upd(i,'rec',this.value)">
          <input value="${r.note}" onchange="upd(i,'note',this.value)">
        </div>
      `;
    }

    if (r.type === "spacer") {
      div.innerHTML = `<div style="height:20px"></div>`;
    }

    if (r.type === "marker") {
      div.innerHTML = `
        <div class="marker" style="background:${r.color}">
          ${r.label}
        </div>
      `;
    }

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
    righe: [{ type: "header" }]
  };

  schede.push(s);
  schedaAttiva = s.id;
  render();
}

// ======================
// LISTA SCHEDE
// ======================
function apriSchede() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <h3>Schede</h3>
    ${schede.map(s => `
      <div class="card">
        <b>${s.nome}</b><br><br>

        <button onclick="apri(${s.id})">Apri</button>
        <button onclick="copia(${s.id})">Copia</button>
        <button onclick="elimina(${s.id})">Elimina</button>
      </div>
    `).join("")}
  `;
}

function apri(id) {
  schedaAttiva = id;
  render();
}

function elimina(id) {
  schede = schede.filter(s => s.id !== id);
  if (!schede.length) nuovaScheda();
  else schedaAttiva = schede[0].id;
  apriSchede();
}

function copia(id) {
  const s = schede.find(x => x.id === id);
  schede.push({
    ...s,
    id: Date.now(),
    nome: s.nome + " (copia)"
  });
  apriSchede();
}

// ======================
// RIGHE
// ======================
function aggiungiRiga() {
  const s = getScheda();

  if (tipoRigaSelezionata === "exercise") {
    s.righe.push({
      type: "exercise",
      nome: "Esercizio",
      serie: "",
      repRange: "",
      kg: "",
      rec: "",
      note: ""
    });
  }

  if (tipoRigaSelezionata === "spacer") {
    s.righe.push({ type: "spacer" });
  }

  if (tipoRigaSelezionata === "marker") {
    const colors = {
      bicipiti: "green",
      tricipiti: "red",
      addominali: "orange",
      gambe: "violet",
      dorso: "white",
      petto: "lightblue",
      spalle: "yellow"
    };

    const key = prompt("Muscolo?");
    s.righe.push({
      type: "marker",
      label: key,
      color: colors[key] || "gray"
    });
  }

  render();
}

// ======================
// UPDATE
// ======================
function upd(i, field, val) {
  getScheda().righe[i][field] = val;
}

function updEx(i, val) {
  getScheda().righe[i].nome = val;
}

// ======================
// NOME SCHEDA
// ======================
function renameScheda(v) {
  getScheda().nome = v;
}

// ======================
// LOCAL AUTO SAVE
// ======================
function autosave() {
  localStorage.setItem("schede", JSON.stringify(schede));
}

// ======================
// CLOUD
// ======================
async function salvaCloud() {
  await fetch(BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": API_KEY
    },
    body: JSON.stringify(schede)
  });

  alert("☁️ Salvato");
}

// ======================
// AUTO SYNC LOOP
// ======================
function autosyncLoop() {
  setInterval(() => {
    autosave();
    salvaCloud();
  }, 30000); // ogni 30s
}

// ======================
window.nuovaScheda = nuovaScheda;
window.apriSchede = apriSchede;
window.apri = apri;
window.copia = copia;
window.elimina = elimina;
window.aggiungiRiga = aggiungiRiga;
window.upd = upd;
window.updEx = updEx;
window.renameScheda = renameScheda;
window.salvaCloud = salvaCloud;

// START
init();