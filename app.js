let schede = [];
let attiva = null;

// INIT
async function init() {
  const local = localStorage.getItem("schede");
  if (local) schede = JSON.parse(local);

  renderHome();
}

// HOME
function renderHome() {
  toolbar(false);
  app.innerHTML = "<div class='home'>Seleziona o crea una scheda</div>";
}

// TOOLBAR
function toolbar(show) {
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

// GET ATTIVA
function getS() {
  return schede.find(s => s.id === attiva);
}

// RENDER SCHEDA
function renderScheda() {
  toolbar(true);
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
          <th>PROGRESSIONI</th>
          <th>NOTE</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
  `;

  s.blocchi.forEach((b,i)=>{
    html += renderBlocco(b,i);
  });

  html += `</tbody></table></div>`;
  app.innerHTML = html;
}

// BLOCCO
function renderBlocco(b,i){

  if (b.type === "marker") {
    return `
    <tr>
      <td colspan="7" class="marker" style="background:${b.color}"></td>
      <td class="actions">
        <span onclick="moveUp(${i})">⬆</span>
        <span onclick="moveDown(${i})">⬇</span>
        <span onclick="del(${i})">✖</span>
      </td>
    </tr>`;
  }

  if (b.type === "spacer") {
    return `
    <tr>
      <td colspan="7" class="spacer"></td>
      <td class="actions">
        <span onclick="moveUp(${i})">⬆</span>
        <span onclick="moveDown(${i})">⬇</span>
        <span onclick="del(${i})">✖</span>
      </td>
    </tr>`;
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

      rows += `
        <td class="serie"><input value="${b.serie[r]||""}" oninput="updArr(${i},'serie',${r},this.value)"></td>
      `;

      if (r === 0) {
        rows += `<td rowspan="${b.rows}">
          <input value="${b.rep}" oninput="upd(${i},'rep',this.value)">
        </td>`;
      }

      rows += `
        <td><input value="${b.kg[r]||""}" oninput="updArr(${i},'kg',${r},this.value)"></td>
      `;

      if (r === 0) {
        rows += `<td rowspan="${b.rows}">
          <input value="${b.rec}" oninput="upd(${i},'rec',this.value)">
        </td>`;
      }

      rows += `
        <td><input value="${b.prog||""}" oninput="upd(${i},'prog',this.value)"></td>
        <td><input value="${b.note||""}" oninput="upd(${i},'note',this.value)"></td>
      `;

      if (r === 0) {
        rows += `
        <td rowspan="${b.rows}" class="actions">
          <span onclick="moveUp(${i})">⬆</span>
          <span onclick="moveDown(${i})">⬇</span>
          <span onclick="del(${i})">✖</span>
        </td>`;
      }

      rows += `</tr>`;
    }

    return rows;
  }
}

// ADD
function addExercise(n){
  getS().blocchi.push({
    type:"exercise",
    rows:n,
    nome:"",
    serie:[],
    kg:[],
    rep:"",
    rec:"",
    prog:"",
    note:""
  });
  renderScheda();
}

function addMarker(){
  const color = document.getElementById("markerColor").value;
  getS().blocchi.push({ type:"marker", color });
  renderScheda();
}

function addSpacer(){
  getS().blocchi.push({ type:"spacer" });
  renderScheda();
}

// UPDATE
function upd(i,f,v){
  getS().blocchi[i][f] = v;
  saveLocal();
}

function updArr(i,f,r,v){
  getS().blocchi[i][f][r] = v;
  saveLocal();
}

// MOVE
function moveUp(i){
  const arr = getS().blocchi;
  if(i===0)return;
  [arr[i],arr[i-1]]=[arr[i-1],arr[i]];
  renderScheda();
}

function moveDown(i){
  const arr = getS().blocchi;
  if(i===arr.length-1)return;
  [arr[i],arr[i+1]]=[arr[i+1],arr[i]];
  renderScheda();
}

// DELETE
function del(i){
  getS().blocchi.splice(i,1);
  renderScheda();
}

// RENAME
function rename(v){
  getS().nome = v;
  saveLocal();
}

// LISTA SCHEDE (FIX FUNZIONANTE)
function elencoSchede(){
  toolbar(false);

  app.innerHTML = schede.map(s => `
    <div class="card">
      ${s.nome}<br><br>
      <button onclick="apri(${s.id})">Apri</button>
      <button onclick="copia(${s.id})">Copia</button>
      <button onclick="eliminaScheda(${s.id})">Elimina</button>
    </div>
  `).join("");
}

function apri(id){
  attiva = id;
  renderScheda();
}

function copia(id){
  const s = schede.find(x => x.id === id);
  schede.push(JSON.parse(JSON.stringify({...s, id: Date.now()})));
  elencoSchede();
}

function eliminaScheda(id){
  schede = schede.filter(s => s.id !== id);
  elencoSchede();
}

// SAVE LOCAL
function saveLocal(){
  localStorage.setItem("schede", JSON.stringify(schede));
}

// PDF
function exportPDF(){
  window.print();
}

// START
init();