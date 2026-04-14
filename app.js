let schede = [];
let attiva = null;

// INIT
function init() {
  const local = localStorage.getItem("schede");
  if (local) schede = JSON.parse(local);

  renderHome();
}

// HOME
function renderHome() {
  toggleToolbar(false);
  app.innerHTML = "Crea o seleziona una scheda";
}

// TOOLBAR
function toggleToolbar(show) {
  document.getElementById("toolbar").classList.toggle("hidden", !show);
}

// NUOVA SCHEDA
function nuovaScheda() {
  const s = {
    id: Date.now(),
    nome: "SCHEDA",
    blocchi: []
  };

  schede.push(s);
  attiva = s.id;
  renderScheda();
}

// GET
function getS() {
  return schede.find(s => s.id === attiva);
}

// RENDER
function renderScheda() {
  toggleToolbar(true);

  const s = getS();

  let html = `
    <div class="container">
      <h2 contenteditable oninput="rename(this.innerText)">
        ${s.nome}
      </h2>

      <table>
        <thead>
          <tr>
            <th>ESERCIZIO</th>
            <th>SERIE</th>
            <th>REP RANGE</th>
            <th>KG</th>
            <th>REC.</th>
            <th>PROGRESSIONE / NOTE</th>
          </tr>
        </thead>
        <tbody>
  `;

  s.blocchi.forEach((b, i) => {
    html += renderBlocco(b, i);
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  app.innerHTML = html;
}

// BLOCCO
function renderBlocco(b, i) {

  if (b.type === "marker") {
    return `<tr><td colspan="6" class="marker" style="background:${b.color}"></td></tr>`;
  }

  if (b.type === "spacer") {
    return `<tr><td colspan="6" class="spacer"></td></tr>`;
  }

  if (b.type === "exercise") {

    let rows = "";

    for (let r = 0; r < b.rows; r++) {

      rows += `<tr>`;

      if (r === 0) {
        rows += `<td rowspan="${b.rows}">
          <input value="${b.nome}" oninput="upd(${i},'nome',this.value)">
        </td>`;
      }

      rows += `<td>
        <input value="${b.serie[r] || ""}" oninput="updArr(${i},'serie',${r},this.value)">
      </td>`;

      if (r === 0) {
        rows += `<td rowspan="${b.rows}">
          <input value="${b.rep}" oninput="upd(${i},'rep',this.value)">
        </td>`;
      }

      rows += `<td>
        <input value="${b.kg[r] || ""}" oninput="updArr(${i},'kg',${r},this.value)">
      </td>`;

      if (r === 0) {
        rows += `<td rowspan="${b.rows}">
          <input value="${b.rec}" oninput="upd(${i},'rec',this.value)">
        </td>`;
      }

      if (r === 0) {
        rows += `<td rowspan="${b.rows}">
          <input value="${b.note}" oninput="upd(${i},'note',this.value)">
        </td>`;
      }

      rows += `</tr>`;
    }

    return rows;
  }
}

// ADD
function addExercise(n) {
  getS().blocchi.push({
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
  getS().blocchi.push({
    type: "marker",
    color: markerColor.value
  });
  renderScheda();
}

function addSpacer() {
  getS().blocchi.push({ type: "spacer" });
  renderScheda();
}

// UPDATE
function upd(i,f,v){ getS().blocchi[i][f]=v; saveLocal(); }
function updArr(i,f,r,v){ getS().blocchi[i][f][r]=v; saveLocal(); }

// RENAME
function rename(v){
  getS().nome = v;
  saveLocal();
}

// LISTA
function elencoSchede(){
  toggleToolbar(false);

  app.innerHTML = schede.map(s=>`
    <div class="card">
      ${s.nome}<br>
      <button onclick="apri(${s.id})">Apri</button>
    </div>
  `).join("");
}

function apri(id){ attiva=id; renderScheda(); }

// SAVE
function saveLocal(){
  localStorage.setItem("schede", JSON.stringify(schede));
}

// CLOUD
async function salvaCloud(){
  await fetch(BASE_URL,{
    method:"PUT",
    headers:{
      "Content-Type":"application/json",
      "X-Master-Key":API_KEY
    },
    body:JSON.stringify(schede)
  });

  alert("☁️ Salvato in cloud");
}

// PDF (base migliorato)
function exportPDF(){
  window.print();
}

// START
init();