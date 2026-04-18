// VARIABILI GLOBALI
let schede = [];
let attiva = null;
let currentMode = 'edit'; // 'read', 'edit', 'train'
let showJammer = false;
let showDX = false;
let showSX = false;

// INIT
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
  updateModeUI();
}

// HOME
function renderHome() {
  toolbar(false);
  app.innerHTML = "<div class='home' style='padding:20px;'>Seleziona o crea una scheda</div>";
}

// TOOLBAR VISIBILITÀ
function toolbar(show) {
  document.getElementById("toolbar").classList.toggle("hidden", !show);
}

// GESTIONE MODALITÀ
function setMode(mode) {
  currentMode = mode;
  updateModeUI();
  
  if (attiva !== null) {
    renderScheda();
  }
}

function updateModeUI() {
  // Aggiorna UI modalità
  document.querySelectorAll('.mode-option').forEach(el => {
    el.classList.remove('active');
  });
  document.getElementById(`mode-${currentMode}`).classList.add('active');
  
  // Abilita/disabilita pulsanti in base alla modalità
  const buttons = document.querySelectorAll('.topbar button:not(.mode-option)');
  const toolbarButtons = document.querySelectorAll('.toolbar button, .toolbar .dropdown, .toolbar .toggle-container, .toolbar .checkbox-group');
  
  if (currentMode === 'read') {
    // Solo Elenco schede è attivo
    buttons.forEach(btn => {
      const text = btn.textContent;
      btn.disabled = text !== 'Elenco schede';
    });
    toolbar(false);
  } else if (currentMode === 'edit') {
    // Tutto attivo
    buttons.forEach(btn => btn.disabled = false);
    if (attiva) toolbar(true);
  } else if (currentMode === 'train') {
    // Solo alcune funzioni
    buttons.forEach(btn => btn.disabled = false);
    if (attiva) toolbar(true);
  }
}

// NUOVA SCHEDA
function nuovaScheda() {
  if (currentMode !== 'edit') return;
  
  const s = {
    id: Date.now(),
    nome: "NUOVA SCHEDA",
    blocchi: []
  };
  schede.push(s);
  attiva = s.id;
  saveLocal();
  renderScheda();
}

// GET SCHEDA ATTIVA
function getS() {
  return schede.find(s => s.id === attiva);
}

// FOCUS AUTOMATICO
function focusFirstInput() {
  if (currentMode === 'edit' || currentMode === 'train') {
    setTimeout(() => {
      const el = document.querySelector("tbody input:not(:disabled)");
      if (el) el.focus();
    }, 50);
  }
}

// RENDER SCHEDA COMPLETA
function renderScheda() {
  toolbar(true);
  const s = getS();
  const isEditMode = currentMode === 'edit';
  const isTrainMode = currentMode === 'train';
  const canEdit = isEditMode || isTrainMode;

  // Costruisci etichette superiori
  let labelsHtml = '<div class="labels-container">';
  labelsHtml += '<div>';
  if (showJammer) {
    const jammerText = document.getElementById('jammerToggle')?.textContent || 'No Jammer';
    labelsHtml += `<span class="jammer-label">${jammerText}</span>`;
  }
  labelsHtml += '</div>';
  
  labelsHtml += '<div>';
  if (showDX) labelsHtml += '<span class="side-label">DX</span>';
  if (showSX) labelsHtml += '<span class="side-label">SX</span>';
  labelsHtml += '</div>';
  labelsHtml += '</div>';

  let html = `
  <div class="container">
    <h2 contenteditable="${isEditMode}" oninput="rename(this.innerText)">${s.nome}</h2>
    ${labelsHtml}
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
    html += renderBlocco(b, i, isEditMode, isTrainMode);
  });

  html += `</tbody></table></div>`;
  app.innerHTML = html;

  // Aggiorna stato pulsante jammer
  updateJammerButton();
  
  focusFirstInput();
}

// RENDER SINGOLO BLOCCO
function renderBlocco(b, i, isEditMode, isTrainMode) {
  const canEdit = isEditMode || isTrainMode;
  const showActions = isEditMode;

  if (b.type === "marker"){
    return `<tr>
      <td colspan="7" class="marker" style="background:${b.color}"></td>
      ${showActions ? `<td class="actions">
        <span onclick="moveUp(${i})">↑</span>
        <span onclick="moveDown(${i})">↓</span>
        <span onclick="del(${i})">✕</span>
      </td>` : '<td></td>'}
    </tr>`;
  }

  if (b.type === "spacer"){
    return `<tr>
      <td colspan="7" class="spacer"></td>
      ${showActions ? `<td class="actions">
        <span onclick="moveUp(${i})">↑</span>
        <span onclick="moveDown(${i})">↓</span>
        <span onclick="del(${i})">✕</span>
      </td>` : '<td></td>'}
    </tr>`;
  }

  if (b.type === "exercise"){
    let rows = "";
    
    // Assicurati che serie e kg siano array
    if (!b.serie) b.serie = [];
    if (!b.kg) b.kg = [];

    for(let r = 0; r < b.rows; r++){
      rows += `<tr class="row-hover">`;

      // Colonna ESERCIZIO (rowspan)
      if(r === 0){
        rows += `<td rowspan="${b.rows}">
          <input value="${b.nome || ''}"
          ${!isEditMode ? 'disabled' : ''}
          oninput="upd(${i},'nome',this.value)">
        </td>`;
      }

      // Colonna SERIE
      rows += `
        <td class="serie">
          <input value="${b.serie[r] || ''}"
          ${!canEdit ? 'disabled' : ''}
          onkeydown="serieKey(event,${i},${r})"
          oninput="updArr(${i},'serie',${r},this.value)">
        </td>
      `;

      // Colonna REP (rowspan)
      if(r === 0){
        rows += `<td rowspan="${b.rows}">
          <input value="${b.rep || ''}"
          ${!isEditMode ? 'disabled' : ''}
          oninput="upd(${i},'rep',this.value)">
        </td>`;
      }

      // Colonna KG
      rows += `
        <td><input value="${b.kg[r] || ''}"
        ${!canEdit ? 'disabled' : ''}
        oninput="updArr(${i},'kg',${r},this.value)"></td>
      `;

      // Colonna REC (rowspan)
      if(r === 0){
        rows += `<td rowspan="${b.rows}">
          <input value="${b.rec || ''}"
          ${!isEditMode ? 'disabled' : ''}
          oninput="upd(${i},'rec',this.value)">
        </td>`;
      }

      // Colonne PROG e NOTE (editabili in tutte le modalità tranne read)
      rows += `
        <td><input value="${b.prog || ''}"
        ${currentMode === 'read' ? 'disabled' : ''}
        oninput="upd(${i},'prog',this.value)"></td>
        <td><input value="${b.note || ''}"
        ${currentMode === 'read' ? 'disabled' : ''}
        oninput="upd(${i},'note',this.value)"></td>
      `;

      // Colonna AZIONI
      if(r === 0){
        rows += `<td rowspan="${b.rows}" class="actions">`;
        if(showActions){
          rows += `
            <span onclick="moveUp(${i})">↑</span>
            <span onclick="moveDown(${i})">↓</span>
            <span onclick="del(${i})">✕</span>
          `;
        }
        rows += `</td>`;
      }

      rows += `</tr>`;
    }

    return rows;
  }
}

// UX: ENTER = nuova riga serie
function serieKey(e, i, r){
  if(e.key === "Enter" && currentMode === 'edit'){
    e.preventDefault();
    const s = getS().blocchi[i];
    if (!s.serie) s.serie = [];
    if (!s.kg) s.kg = [];
    s.serie.push("");
    s.kg.push("");
    saveLocal();
    renderScheda();
  }
}

// AGGIUNTA ESERCIZI
function addExercise(n){
  if (currentMode !== 'edit') return;
  
  const nuovo = {
    type: "exercise",
    rows: n,
    nome: "",
    serie: Array(n).fill(""),
    kg: Array(n).fill(""),
    rep: "",
    rec: "",
    prog: "",
    note: ""
  };
  
  getS().blocchi.push(nuovo);
  saveLocal();
  renderScheda();
}

// TOGGLE DROPDOWN MARKER
function toggleMarkerDropdown() {
  if (currentMode !== 'edit') return;
  const dropdown = document.getElementById('markerDropdown');
  dropdown.classList.toggle('hidden');
  
  // Chiudi dropdown quando clicchi fuori
  if (!dropdown.classList.contains('hidden')) {
    setTimeout(() => {
      document.addEventListener('click', function closeDropdown(e) {
        if (!e.target.closest('.dropdown')) {
          dropdown.classList.add('hidden');
          document.removeEventListener('click', closeDropdown);
        }
      });
    }, 100);
  }
}

// AGGIUNGI MARKER DA DROPDOWN
function addMarkerFromDropdown(color, muscolo) {
  if (currentMode !== 'edit') return;
  
  getS().blocchi.push({
    type: "marker",
    color: color,
    muscolo: muscolo
  });
  
  document.getElementById('markerDropdown').classList.add('hidden');
  saveLocal();
  renderScheda();
}

// AGGIUNGI SPAZIO
function addSpacer(){
  if (currentMode !== 'edit') return;
  
  getS().blocchi.push({type: "spacer"});
  saveLocal();
  renderScheda();
}

// TOGGLE JAMMER
function toggleJammer() {
  if (currentMode !== 'edit') return;
  
  showJammer = !showJammer;
  updateJammerButton();
  if (attiva) renderScheda();
}

function updateJammerButton() {
  const btn = document.getElementById('jammerToggle');
  if (btn) {
    btn.textContent = showJammer ? 'Si Jammer' : 'No Jammer';
    btn.className = `toggle-btn ${showJammer ? 'on' : 'off'}`;
  }
}

// UPDATE LABELS DX/SX
function updateSideLabels() {
  if (currentMode !== 'edit') return;
  
  showDX = document.getElementById('checkDX').checked;
  showSX = document.getElementById('checkSX').checked;
  
  if (attiva) renderScheda();
}

// FUNZIONI UPDATE
function upd(i, f, v){ 
  if (currentMode === 'read') return;
  getS().blocchi[i][f] = v; 
  saveLocal(); 
}

function updArr(i, f, r, v){ 
  if (currentMode === 'read') return;
  if (!getS().blocchi[i][f]) getS().blocchi[i][f] = [];
  getS().blocchi[i][f][r] = v; 
  saveLocal(); 
}

// MOVIMENTO
function moveUp(i){
  if (currentMode !== 'edit') return;
  let arr = getS().blocchi;
  if(i === 0) return;
  [arr[i], arr[i-1]] = [arr[i-1], arr[i]];
  saveLocal();
  renderScheda();
}

function moveDown(i){
  if (currentMode !== 'edit') return;
  let arr = getS().blocchi;
  if(i === arr.length-1) return;
  [arr[i], arr[i+1]] = [arr[i+1], arr[i]];
  saveLocal();
  renderScheda();
}

// ELIMINA
function del(i){
  if (currentMode !== 'edit') return;
  getS().blocchi.splice(i, 1);
  saveLocal();
  renderScheda();
}

// RINOMINA
function rename(v){
  if (currentMode !== 'edit') return;
  getS().nome = v;
  saveLocal();
}

// ELENCO SCHEDE
function elencoSchede(){
  toolbar(false);

  app.innerHTML = `
    <div style="padding:20px;">
      <h2 style="color:var(--text-light)">Le tue schede</h2>
      ${schede.map(s=>`
        <div class="card">
          <div class="card-title">${s.nome}</div>
          <button onclick="apri(${s.id})">Apri</button>
          ${currentMode === 'edit' ? `
            <button onclick="copia(${s.id})">Copia</button>
            <button onclick="eliminaScheda(${s.id})">Elimina</button>
          ` : ''}
        </div>
      `).join("")}
    </div>
  `;
}

function apri(id){
  attiva = id;
  renderScheda();
}

function copia(id){
  if (currentMode !== 'edit') return;
  const s = schede.find(x => x.id === id);
  const nuova = JSON.parse(JSON.stringify(s));
  nuova.id = Date.now();
  nuova.nome = s.nome + " (copia)";
  schede.push(nuova);
  saveLocal();
  elencoSchede();
}

function eliminaScheda(id){
  if (currentMode !== 'edit') return;
  if (!confirm('Eliminare questa scheda?')) return;
  schede = schede.filter(s => s.id !== id);
  saveLocal();
  elencoSchede();
}

// SALVATAGGIO CLOUD
async function salvaCloud() {
  if (currentMode === 'read') return;
  
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': API_KEY
      },
      body: JSON.stringify(schede)
    });
    
    if (response.ok) {
      alert('✅ Salvato nel cloud!');
    } else {
      throw new Error('Errore nel salvataggio');
    }
  } catch (error) {
    alert('❌ Errore: ' + error.message);
  }
}

// EXPORT PDF
function exportPDF() {
  if (!attiva) {
    alert('Apri prima una scheda');
    return;
  }
  
  const s = getS();
  let content = `SCHEDA: ${s.nome}\n`;
  content += '=' .repeat(50) + '\n\n';
  
  s.blocchi.forEach(b => {
    if (b.type === 'exercise') {
      content += `ESERCIZIO: ${b.nome}\n`;
      content += `Serie: ${b.serie.join(', ')} | Rep: ${b.rep} | Rec: ${b.rec}\n`;
      content += `KG: ${b.kg.join(', ')}\n`;
      if (b.prog) content += `Progressione: ${b.prog}\n`;
      if (b.note) content += `Note: ${b.note}\n`;
      content += '-'.repeat(30) + '\n';
    }
  });
  
  // Crea blob e scarica
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${s.nome}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

// SAVE LOCAL
function saveLocal(){
  localStorage.setItem("schede", JSON.stringify(schede));
}

// AVVIA APP
init();