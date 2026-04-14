let schede = [];
let attiva = null;

// ================= INIT =================
async function init() {
  const local = localStorage.getItem("schede");
  if (local) schede = JSON.parse(local);

  const cloud = await caricaCloud();
  if (cloud?.length) schede = cloud;

  renderHome();
}

// ================= HOME =================
function renderHome() {
  document.getElementById("toolbar").classList.add("hidden");
  document.getElementById("app").innerHTML = `
    <div class="home">Seleziona o crea una scheda</div>
  `;
}

// ================= NUOVA SCHEDA =================
function nuovaScheda() {
  const s = {
    id: Date.now(),
    nome: "Nuova Scheda",
    blocchi: []
  };

  schede.push(s);
  attiva = s.id;

  renderScheda();
}

// ================= RENDER SCHEDA =================
function renderScheda() {
  document.getElementById("toolbar").classList.remove("hidden");

  const s = schede.find(x => x.id === attiva);

  let html = `
    <div class="header-grid">
      <div>ESERCIZIO</div>
      <div>SERIE</div>
      <div>REP</div>
      <div>KG</div>
      <div>REC</div>
      <div>NOTE</div>
    </div>
  `;

  s.blocchi.forEach((b, i) => {
    if (b.type === "exercise") {
      html += renderExercise(b, i);
    }

    if (b.type === "marker") {
      html += `<div class="marker" style="background:${b.color}"></div>`;
    }

    if (b.type === "spacer") {
      html += `<div class="spacer"></div>`;
    }
  });

  document.getElementById("app").innerHTML = html;
}

// ================= EXERCISE =================
function renderExercise(b, index) {
  let rows = "";

  for (let i = 0; i < b.rows; i++) {
    rows += `
      <div class="row">
        ${i === 0 ? `<input value="${b.nome}" class="big">` : `<div></div>`}
        <input value="${b.serie[i] || ""}">
        ${i === 0 ? `<input value="${b.rep}" class="big">` : `<div></div>`}
        <input value="${b.kg[i] || ""}">
        ${i === 0 ? `<input value="${b.rec}" class="big">` : `<div></div>`}
        ${i === 0 ? `<input value="${b.note}" class="big">` : `<div></div>`}
      </div>
    `;
  }

  return `
    <div class="block" draggable="true">
      ${rows}
      <button onclick="del(${index})">X</button>
    </div>
  `;
}

// ================= ADD =================
function addExercise(n) {
  const s = schede.find(x => x.id === attiva);

  s.blocchi.push({
    type: "exercise",
    rows: n,
    nome: "",
    serie: [],
    kg: [],
    rep: "",
    rec: "",
    note: ""
  });

  renderScheda();
}

function addMarker() {
  const color = document.getElementById("markerColor").value;

  schede.find(x => x.id === attiva).blocchi.push({
    type: "marker",
    color
  });

  renderScheda();
}

function addSpacer() {
  schede.find(x => x.id === attiva).blocchi.push({
    type: "spacer"
  });

  renderScheda();
}

// ================= DELETE =================
function del(i) {
  const s = schede.find(x => x.id === attiva);
  s.blocchi.splice(i, 1);
  renderScheda();
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

  alert("Salvato");
}

// ================= START =================
init();