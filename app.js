let schede = [];
let attiva = null;

/* ======================
   🔧 COLORI MARKER
   modifica qui facilmente
====================== */
const MARKERS = [
  {nome:"Bicipiti", colore:"green"},
  {nome:"Tricipiti", colore:"red"},
  {nome:"Addominali", colore:"#fa8405"},
  {nome:"Gambe", colore:"#8f0663"},
  {nome:"Dorso", colore:"white"},
  {nome:"Spalle", colore:"yellow"}
];

/* ======================
   INIT
====================== */
async function init() {
  const cloud = await caricaCloud();

  if (cloud && cloud.length) {
    schede = cloud;
    saveLocal();
  } else {
    const local = localStorage.getItem("schede");
    if (local) schede = JSON.parse(local);
  }

  renderHome();
}

/* ======================
   HOME
====================== */
function renderHome() {
  toolbar(false);
  app.innerHTML = "<div class='home'>Seleziona o crea una scheda</div>";
}

/* ======================
   TOOLBAR
====================== */
function toolbar(show) {
  document.getElementById("toolbar").classList.toggle("hidden", !show);
}

/* ======================
   NUOVA SCHEDA
====================== */
function nuovaScheda() {
  const s = {
    id: Date.now(),
    nome: "SCHEDA",
    blocchi: []
  };
  schede.push(s);
  attiva = s.id;
  saveLocal();
  renderScheda();
}

function getS() {
  return schede.find(s => s.id === attiva);
}

/* ======================
   MARKER MENU
====================== */
function toggleMarkerMenu(){

  let menu = document.getElementById("markerMenu");

  if(menu){
    menu.remove();
    return;
  }

  menu = document.createElement("div");
  menu.id = "markerMenu";

  menu.style.position = "fixed";
  menu.style.top = "60px";
  menu.style.left = "10px";
  menu.style.background = "#16263f";
  menu.style.border = "1px solid #223a5c";
  menu.style.borderRadius = "6px";
  menu.style.padding = "5px";
  menu.style.zIndex = "2000";

  MARKERS.forEach(m=>{
    const btn = document.createElement("div");

    btn.innerText = m.nome;
    btn.style.padding = "6px";
    btn.style.cursor = "pointer";
    btn.style.color = "#dbe9ff";

    btn.onclick = ()=>{
      addMarker(m.colore);
      menu.remove();
    };

    btn.onmouseover = ()=> btn.style.background="#1d3557";
    btn.onmouseout = ()=> btn.style.background="transparent";

    menu.appendChild(btn);
  });

  document.body.appendChild(menu);
}

/* ======================
   RENDER SCHEDA
====================== */
function renderScheda() {
  toolbar(true);
  const s = getS();

  let html = `
  <div class="container">
    <h2 contenteditable oninput="rename(this.innerText)">${s.nome}</h2>

    <table>
      <thead>
        <tr>
          <th>ESERCIZIO</th>
          <th>SERIE</th>
          <th>REP</th>
          <th>KG</th>
          <th>REC</th>
          <th>PROG</th>
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

  focusFirstInput();
}

/* ======================
   BLOCCO
====================== */
function renderBlocco(b,i){

  if (b.type==="marker"){
    return `<tr>
      <td colspan="7" class="marker" style="background:${b.color}"></td>
      <td class="actions">
        <span onclick="moveUp(${i})">↑</span>
        <span onclick="moveDown(${i})">↓</span>
        <span onclick="del(${i})">✕</span>
      </td>
    </tr>`;
  }

  if (b.type==="spacer"){
    return `<tr>
      <td colspan="7" class="spacer"></td>
      <td class="actions">
        <span onclick="moveUp(${i})">↑</span>
        <span onclick="moveDown(${i})">↓</span>
        <span onclick="del(${i})">✕</span>
      </td>
    </tr>`;
  }

  if (b.type==="exercise"){
    let rows="";

    for(let r=0;r<b.rows;r++){
      rows+=`<tr class="row-hover">`;

      if(r===0){
        rows+=`<td rowspan="${b.rows}">
          <input value="${b.nome}"
          oninput="upd(${i},'nome',this.value)">
        </td>`;
      }

      rows+=`
        <td class="serie">
          <input value="${b.serie[r]||""}"
          onkeydown="serieKey(event,${i},${r})"
          oninput="updArr(${i},'serie',${r},this.value)">
        </td>
      `;

      if(r===0){
        rows+=`<td rowspan="${b.rows}">
          <input value="${b.rep}" oninput="upd(${i},'rep',this.value)">
        </td>`;
      }

      rows+=`
        <td><input value="${b.kg[r]||""}" oninput="updArr(${i},'kg',${r},this.value)"></td>
        <td><input value="${b.rec}" oninput="upd(${i},'rec',this.value)"></td>
        <td><input value="${b.prog||""}" oninput="upd(${i},'prog',this.value)"></td>
        <td><input value="${b.note||""}" oninput="upd(${i},'note',this.value)"></td>
      `;

      if(r===0){
        rows+=`<td rowspan="${b.rows}" class="actions">
          <span onclick="moveUp(${i})">↑</span>
          <span onclick="moveDown(${i})">↓</span>
          <span onclick="del(${i})">✕</span>
        </td>`;
      }

      rows+=`</tr>`;
    }

    return rows;
  }
}

/* ======================
   ADD
====================== */
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
  saveLocal();
  renderScheda();
}

/* 🔧 marker aggiornato */
function addMarker(colore){
  getS().blocchi.push({
    type:"marker",
    color:colore
  });
  saveLocal();
  renderScheda();
}

function addSpacer(){
  getS().blocchi.push({type:"spacer"});
  saveLocal();
  renderScheda();
}

/* ======================
   UPDATE
====================== */
function upd(i,f,v){ getS().blocchi[i][f]=v; saveLocal(); }
function updArr(i,f,r,v){ getS().blocchi[i][f][r]=v; saveLocal(); }

/* ======================
   MOVE / DELETE
====================== */
function moveUp(i){
  let arr=getS().blocchi;
  if(i===0)return;
  [arr[i],arr[i-1]]=[arr[i-1],arr[i]];
  saveLocal();
  renderScheda();
}

function moveDown(i){
  let arr=getS().blocchi;
  if(i===arr.length-1)return;
  [arr[i],arr[i+1]]=[arr[i+1],arr[i]];
  saveLocal();
  renderScheda();
}

function del(i){
  getS().blocchi.splice(i,1);
  saveLocal();
  renderScheda();
}

/* ======================
   ALTRO
====================== */
function rename(v){
  getS().nome=v;
  saveLocal();
}

function saveLocal(){
  localStorage.setItem("schede",JSON.stringify(schede));
}

init();