let schede = [];
let schedaAttiva = null;

// ================= INIT =================
async function init() {
  const local = localStorage.getItem("schede");
  if (local) schede = JSON.parse(local);

  const cloud = await caricaCloud();
  if (cloud?.length) schede = cloud;

  if (!schede.length) nuovaScheda();

  schedaAttiva = schede[0].id;
  render();
  autosaveLoop();
}

// ================= GET =================
function getScheda() {
  return schede.find(s => s.id === schedaAttiva);
}

// ================= RENDER =================
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

    // HEADER
    if (r.type === "header") {
      div.innerHTML = `
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

    // EXERCISE
    if (r.type === "exercise") {
      div.innerHTML = `
        <div class="grid">
          <input value="${r.nome}" oninput="upd(${i},'nome',this.value)">
          <input value="${r.serie}" oninput="upd(${i},'serie',this.value)">
          <input value="${r.repRange}" oninput="upd(${i},'repRange',this.value)">
          <input value="${r.kg}" oninput="upd(${i},'kg',this.value)">
          <input value="${r.rec}" oninput="upd(${i},'rec',this.value)">
          <input value="${r.note}" oninput="upd(${i},'note',this.value)">
        </div>
      `;
    }

    // SPACER (INVISIBILE)
    if (r.type === "spacer") {
      div.innerHTML = `<div class="spacer"></div>`;
    }

    // MARKER (SOLO COLORE)
    if (r.type === "marker") {
      div.innerHTML = `<div class="marker" style="background:${r.color}"></div>`;
    }

    app.appendChild(div);
  });
}

// ================= NUOVA SCHEDA =================
function nuovaScheda() {
  schede.push({
    id: Date.now(),
    nome: "Nuova Scheda",
    righe: [{ type: "header" }]
  });

  schedaAttiva = schede.at(-1).id;
  render();
}

// ================= LISTA =================
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

// ================= AGGIUNGI RIGA =================
function aggiungiRiga() {
  const s = getScheda();
  const tipo = document.getElementById("tipoRiga").value;

  if (tipo === "exercise") {
    s.righe.push({
      type: "exercise",
      nome: "",
      serie: "",
      repRange: "",
      kg: "",
      rec: "",
      note: ""
    });
  }

  if (tipo === "header") {
    s.righe.push({ type: "header" });
  }

  if (tipo === "spacer") {
    s.righe.push({ type: "spacer" });
  }

  if (tipo === "marker") {
    const color = document.getElementById("markerColor").value;
    s.righe.push({ type: "marker", color });
  }

  render();
}

// ================= UPDATE =================
function upd(i, field, val) {
  getScheda().righe[i][field] = val;
}

// ================= NOME =================
function renameScheda(v) {
  getScheda().nome = v;
}

// ================= AUTOSAVE =================
function autosave() {
  localStorage.setItem("schede", JSON.stringify(schede));
}

// ================= CLOUD =================
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

// ================= LOOP =================
function autosaveLoop() {
  setInterval(() => {
    autosave();
  }, 3000);
}

// ================= GLOBAL =================
window.nuovaScheda = nuovaScheda;
window.apriSchede = apriSchede;
window.apri = apri;
window.copia = copia;
window.elimina = elimina;
window.aggiungiRiga = aggiungiRiga;
window.upd = upd;
window.renameScheda = renameScheda;
window.salvaCloud = salvaCloud;

// START
init();