let schede = [];
let attiva = null;
let dragIndex = null;

// INIT
async function init() {
  const local = localStorage.getItem("schede");
  if (local) schede = JSON.parse(local);

  if (!schede.length) renderHome();
  else renderHome();
}

// HOME
function renderHome() {
  toolbar(false);
  app.innerHTML = "Crea o seleziona una scheda";
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

// GET
function getS() {
  return schede.find(s => s.id === attiva);
}

// RENDER
function renderScheda() {
  toolbar(true);

  const s = getS();

  let html = `
    <div class="container">
      <h2 contenteditable oninput="rename(this.innerText)">
        ${s.nome}
      </h2>

      <div class="header">
        <div>ESERCIZIO</div>
        <div>SERIE</div>
        <div>REP RANGE</div>
        <div>KG</div>
        <div>REC.</div>
        <div>NOTE</div>
      </div>
  `;

  s.blocchi.forEach((b, i) => {
    html += renderBlocco(b, i);
  });

  html += `</div>`;
  app.innerHTML = html;
}

// BLOCCO
function renderBlocco(b, i) {

  if (b.type === "marker")
    return `<div class="marker" style="background:${b.color}"></div>`;

  if (b.type === "spacer")
    return `<div class="spacer"></div>`;

  if (b.type === "exercise") {
    let rows = "";

    for (let r = 0; r < b.rows; r++) {
      rows += `
      <div class="row">
        ${r === 0 ? `<input value="${b.nome}" oninput="upd(${i},'nome',this.value)">` : `<div></div>`}
        <input value="${b.serie[r]||""}" oninput="updArr(${i},'serie',${r},this.value)">
        ${r === 0 ? `<input value="${b.rep}" oninput="upd(${i},'rep',this.value)">` : `<div></div>`}
        <input value="${b.kg[r]||""}" oninput="updArr(${i},'kg',${r},this.value)">
        ${r === 0 ? `<input value="${b.rec}" oninput="upd(${i},'rec',this.value)">` : `<div></div>`}
        ${r === 0 ? `<input value="${b.note}" oninput="upd(${i},'note',this.value)">` : `<div></div>`}
      </div>`;
    }

    return `
    <div class="block" draggable="true"
      ondragstart="dragStart(${i})"
      ondragover="event.preventDefault()"
      ondrop="drop(${i})">

      ${rows}
      <button class="delete" onclick="del(${i})">✖</button>
    </div>`;
  }
}

// ADD
function addExercise(n) {
  getS().blocchi.push({
    type:"exercise",
    rows:n,
    nome:"",
    serie:[],
    kg:[],
    rep:"",
    rec:"",
    note:""
  });
  renderScheda();
}

function addMarker() {
  getS().blocchi.push({
    type:"marker",
    color:markerColor.value
  });
  renderScheda();
}

function addSpacer() {
  getS().blocchi.push({type:"spacer"});
  renderScheda();
}

// UPDATE
function upd(i,f,v){ getS().blocchi[i][f]=v; saveLocal(); }
function updArr(i,f,r,v){ getS().blocchi[i][f][r]=v; saveLocal(); }

// DELETE
function del(i){
  getS().blocchi.splice(i,1);
  renderScheda();
}

// DRAG
function dragStart(i){ dragIndex=i; }
function drop(i){
  const arr=getS().blocchi;
  const item=arr.splice(dragIndex,1)[0];
  arr.splice(i,0,item);
  renderScheda();
}

// RENAME
function rename(v){
  getS().nome=v;
  saveLocal();
}

// LISTA
function elencoSchede(){
  toolbar(false);

  app.innerHTML = schede.map(s=>`
    <div class="card">
      ${s.nome}
      <br>
      <button onclick="apri(${s.id})">Apri</button>
      <button onclick="copia(${s.id})">Copia</button>
      <button onclick="eliminaScheda(${s.id})">Elimina</button>
    </div>
  `).join("");
}

function apri(id){ attiva=id; renderScheda(); }
function copia(id){
  const s=schede.find(x=>x.id===id);
  schede.push(JSON.parse(JSON.stringify({...s,id:Date.now()})));
  elencoSchede();
}
function eliminaScheda(id){
  schede=schede.filter(s=>s.id!==id);
  elencoSchede();
}

// SAVE
function saveLocal(){
  localStorage.setItem("schede",JSON.stringify(schede));
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
  alert("Salvato cloud");
}

// PDF
function exportPDF(){
  window.print();
}

// START
init();