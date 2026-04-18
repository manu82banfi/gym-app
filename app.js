let schede = [];
let attiva = null;
let mode = "modifica"; // modalità

// stato extra
let jammer = null;
let side = "";

// INIT
async function init() {
  const cloud = await caricaCloud();
  if (cloud.length) schede = cloud;
  else schede = JSON.parse(localStorage.getItem("schede") || "[]");
  renderHome();
}

// MODALITÀ
function setMode(m){
  mode = m;
  renderScheda();
}

// MARKER MENU
function toggleMarkerMenu(){
  markerMenu.classList.toggle("hidden");
}

// JAMMER
function toggleJammer(){
  jammer = jammer === "Si Jammer" ? "No Jammer" : "Si Jammer";
  renderScheda();
}

// DX SX
function toggleSide(s){
  side = side === s ? "" : s;
  renderScheda();
}

// NUOVA
function nuovaScheda(){
  schede.push({id:Date.now(),nome:"SCHEDA",blocchi:[]});
  attiva = schede[schede.length-1].id;
  saveLocal();
  renderScheda();
}

// GET
function getS(){return schede.find(s=>s.id===attiva);}

// RENDER
function renderScheda(){
  if(mode==="lettura"){ toolbar(false); }

  const s = getS();

  let html = `<div class="container">
  <h2 contenteditable>${s.nome}</h2>

  <table>
  <thead>`;

  // RIGA EXTRA (JAMMER / DX SX)
  if(jammer || side){
    html+=`<tr class="info-row">
      <td colspan="8">${jammer || ""} ${side}</td>
    </tr>`;
  }

  html+=`
  <tr>
  <th>ESERCIZIO</th>
  <th>SERIE</th>
  <th>REP</th>
  <th>KG</th>
  <th>REC</th>
  <th>PROG</th>
  <th>NOTE</th>
  <th></th>
  </tr></thead><tbody>`;

  s.blocchi.forEach((b,i)=> html+=renderBlocco(b,i));

  html+=`</tbody></table></div>`;
  app.innerHTML = html;
}

// BLOCCO
function renderBlocco(b,i){

  if(b.type==="marker"){
    return `<tr><td colspan="7" class="marker" style="background:${b.color}"></td>
    <td><button onclick="del(${i})">X</button></td></tr>`;
  }

  if(b.type==="exercise"){
    let rows="";
    for(let r=0;r<b.rows;r++){

      rows+=`<tr>`;

      if(r===0){
        rows+=`<td rowspan="${b.rows}"><input value="${b.nome||""}"></td>`;
        rows+=`<td rowspan="${b.rows}"><input value="${b.rep||""}"></td>`;
        rows+=`<td rowspan="${b.rows}"><input value="${b.rec||""}"></td>`; // REC FIX
      }

      rows+=`<td><input></td>`;
      rows+=`<td><input></td>`;

      rows+=`</tr>`;
    }
    return rows;
  }

  return "";
}

// ADD
function addExercise(n){
  getS().blocchi.push({type:"exercise",rows:n});
  saveLocal();
  renderScheda();
}

function addMarker(color){
  getS().blocchi.push({type:"marker",color});
  saveLocal();
  renderScheda();
}

// SAVE
function saveLocal(){
  localStorage.setItem("schede",JSON.stringify(schede));
}

// CLOUD FIX
async function salvaCloud(){
  await fetch(BASE_URL,{
    method:"PUT",
    headers:{
      "Content-Type":"application/json",
      "X-Master-Key":API_KEY
    },
    body:JSON.stringify(schede)
  });
  alert("Salvato in cloud");
}

// PDF FIX
function exportPDF(){
  const el = document.querySelector(".container");
  html2pdf().from(el).save("scheda.pdf");
}

init();