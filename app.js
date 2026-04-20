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
  app.innerHTML = "<div class='home'>Seleziona o crea una scheda</div>";
}

// TOOLBAR VISIBILITÀ
function toolbar(show) {
  document.getElementById("toolbar").classList.toggle("hidden", !show);
}

// GESTIONE MODALITÀ
function setMode(mode) {
  currentMode = mode;
  updateModeUI();
  
  const checkDX = document.getElementById('checkDX');
  const checkSX = document.getElementById('checkSX');
  
  if (checkDX && checkSX) {
    checkDX.disabled = (currentMode === 'train' || currentMode === 'read');
    checkSX.disabled = (currentMode === 'train' || currentMode === 'read');
  }
  
  if (attiva !== null) {
    renderScheda();
  }
}

function updateModeUI() {
  document.querySelectorAll('.mode-option').forEach(el => {
    el.classList.remove('active');
  });
  document.getElementById(`mode-${currentMode}`).classList.add('active');
  
  const buttons = document.querySelectorAll('.topbar button:not(.mode-option)');
  
  if (currentMode === 'read') {
    buttons.forEach(btn => {
      const text = btn.textContent;
      btn.disabled = text !== 'Elenco schede';
    });
    toolbar(false);
  } else if (currentMode === 'edit') {
    buttons.forEach(btn => btn.disabled = false);
    if (attiva) toolbar(true);
  } else if (currentMode === 'train') {
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

// RENDER SCHEDA COMPLETA - NON MODIFICA I DATI
function renderScheda() {
  toolbar(true);
  const s = getS();
  
  if (!s) {
    renderHome();
    return;
  }
  
  const isEditMode = currentMode === 'edit';
  const isTrainMode = currentMode === 'train';
  const canEdit = isEditMode || isTrainMode;

  let labelsHtml = '<div class="labels-container">';
  
  if (showJammer) {
    labelsHtml += `<span class="jammer-label">${showJammer ? 'Si Jammer' : 'No Jammer'}</span>`;
  }
  
  if (showDX) labelsHtml += '<span class="side-label">DX</span>';
  if (showSX) labelsHtml += '<span class="side-label">SX</span>';
  
  labelsHtml += '</div>';

  let html = `
  <div class="container">
    <h2 contenteditable="${isEditMode}" oninput="rename(this.innerText)">${s.nome || 'SCHEDA'}</h2>
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

  s.blocchi.forEach((b, i) => {
    html += renderBlocco(b, i, isEditMode, isTrainMode);
  });

  html += `</tbody></table></div>`;
  app.innerHTML = html;

  updateJammerButton();
  updateCheckboxState();
  
  focusFirstInput();
}

// RENDER SINGOLO BLOCCO - NON MODIFICA I DATI
function renderBlocco(b, i, isEditMode, isTrainMode) {
  const canEdit = isEditMode || isTrainMode;
  const showActions = isEditMode;

  if (b.type === "marker") {
    return `<tr>
      <td colspan="7" class="marker" style="background:${b.color || '#4CAF50'}"></td>
      ${showActions ? `<td class="actions">
        <span onclick="moveUp(${i})">↑</span>
        <span onclick="moveDown(${i})">↓</span>
        <span onclick="del(${i})">✕</span>
      </td>` : '<td></td>'}
    </tr>`;
  }

  if (b.type === "spacer") {
    return `<tr>
      <td colspan="7" class="spacer"></td>
      ${showActions ? `<td class="actions">
        <span onclick="moveUp(${i})">↑</span>
        <span onclick="moveDown(${i})">↓</span>
        <span onclick="del(${i})">✕</span>
      </td>` : '<td></td>'}
    </tr>`;
  }

  if (b.type === "exercise") {
    let rows = "";
    
    // Usa i dati esattamente come sono, senza modificarli
    const nome = b.nome || '';
    const rep = b.rep || '';
    const rec = b.rec || '';
    const prog = b.prog || '';
    const note = b.note || '';
    const serie = b.serie || [];
    const kg = b.kg || [];
    const numRows = b.rows || 1;

    for (let r = 0; r < numRows; r++) {
      rows += `<tr class="row-hover">`;

      // Colonna ESERCIZIO
      if (r === 0) {
        rows += `<td rowspan="${numRows}">
          <input value="${escapeHtml(nome)}"
          ${!isEditMode ? 'disabled' : ''}
          oninput="upd(${i},'nome',this.value)">
        </td>`;
      }

      // Colonna SERIE
      rows += `
        <td class="serie">
          <input value="${escapeHtml(serie[r] || '')}"
          ${!canEdit ? 'disabled' : ''}
          onkeydown="serieKey(event,${i},${r})"
          oninput="updArr(${i},'serie',${r},this.value)">
        </td>
      `;

      // Colonna REP
      if (r === 0) {
        rows += `<td rowspan="${numRows}">
          <input value="${escapeHtml(rep)}"
          ${!isEditMode ? 'disabled' : ''}
          oninput="upd(${i},'rep',this.value)">
        </td>`;
      }

      // Colonna KG
      rows += `
        <td><input value="${escapeHtml(kg[r] || '')}"
        ${!canEdit ? 'disabled' : ''}
        oninput="updArr(${i},'kg',${r},this.value)"></td>
      `;

      // Colonna REC
      if (r === 0) {
        rows += `<td rowspan="${numRows}">
          <input value="${escapeHtml(rec)}"
          ${!isEditMode ? 'disabled' : ''}
          oninput="upd(${i},'rec',this.value)">
        </td>`;
      }

      // Colonne PROG e NOTE
      rows += `
        <td><input value="${escapeHtml(prog)}"
        ${currentMode === 'read' ? 'disabled' : ''}
        oninput="upd(${i},'prog',this.value)"></td>
        <td><input value="${escapeHtml(note)}"
        ${currentMode === 'read' ? 'disabled' : ''}
        oninput="upd(${i},'note',this.value)"></td>
      `;

      // Colonna AZIONI
      if (r === 0) {
        rows += `<td rowspan="${numRows}" class="actions">`;
        if (showActions) {
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

// Funzione per escape HTML
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// UX: ENTER = nuova riga serie
function serieKey(e, i, r) {
  if (e.key === "Enter" && currentMode === 'edit') {
    e.preventDefault();
    const s = getS();
    if (!s) return;
    
    const blocco = s.blocchi[i];
    if (!blocco) return;
    
    if (!blocco.serie) blocco.serie = [];
    if (!blocco.kg) blocco.kg = [];
    
    blocco.serie.push("");
    blocco.kg.push("");
    blocco.rows = blocco.serie.length;
    
    saveLocal();
    renderScheda();
  }
}

// AGGIUNTA ESERCIZI
function addExercise(n) {
  if (currentMode !== 'edit') return;
  
  const s = getS();
  if (!s) return;
  
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
  
  s.blocchi.push(nuovo);
  saveLocal();
  renderScheda();
}

// TOGGLE DROPDOWN MARKER
function toggleMarkerDropdown() {
  if (currentMode !== 'edit') return;
  const dropdown = document.getElementById('markerDropdown');
  dropdown.classList.toggle('hidden');
  
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
  
  const s = getS();
  if (!s) return;
  
  s.blocchi.push({
    type: "marker",
    color: color,
    muscolo: muscolo
  });
  
  document.getElementById('markerDropdown').classList.add('hidden');
  saveLocal();
  renderScheda();
}

// AGGIUNGI SPAZIO
function addSpacer() {
  if (currentMode !== 'edit') return;
  
  const s = getS();
  if (!s) return;
  
  s.blocchi.push({type: "spacer"});
  saveLocal();
  renderScheda();
}

// TOGGLE JAMMER - SOLO VISUALE, NON MODIFICA DATI
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

// UPDATE LABELS DX/SX - SOLO VISUALE, NON MODIFICA DATI
function updateSideLabels() {
  if (currentMode !== 'edit') return;
  
  const checkDX = document.getElementById('checkDX');
  const checkSX = document.getElementById('checkSX');
  
  if (checkDX.checked) {
    checkSX.checked = false;
    showDX = true;
    showSX = false;
  } else if (checkSX.checked) {
    checkDX.checked = false;
    showDX = false;
    showSX = true;
  } else {
    showDX = false;
    showSX = false;
  }
  
  if (attiva) renderScheda();
}

function updateCheckboxState() {
  const checkDX = document.getElementById('checkDX');
  const checkSX = document.getElementById('checkSX');
  
  if (checkDX && checkSX) {
    checkDX.checked = showDX;
    checkSX.checked = showSX;
    checkDX.disabled = (currentMode === 'train' || currentMode === 'read');
    checkSX.disabled = (currentMode === 'train' || currentMode === 'read');
  }
}

// FUNZIONI UPDATE - MODIFICANO SOLO IL DATO SPECIFICO
function upd(i, f, v) { 
  if (currentMode === 'read') return;
  const s = getS();
  if (s && s.blocchi[i]) {
    s.blocchi[i][f] = v;
    saveLocal();
  }
}

function updArr(i, f, r, v) { 
  if (currentMode === 'read') return;
  const s = getS();
  if (s && s.blocchi[i]) {
    if (!s.blocchi[i][f]) s.blocchi[i][f] = [];
    s.blocchi[i][f][r] = v;
    saveLocal();
  }
}

// MOVIMENTO - NON MODIFICA I DATI, SOLO L'ORDINE
function moveUp(i) {
  if (currentMode !== 'edit') return;
  const s = getS();
  if (!s) return;
  
  let arr = s.blocchi;
  if (i === 0) return;
  
  [arr[i], arr[i-1]] = [arr[i-1], arr[i]];
  saveLocal();
  renderScheda();
}

function moveDown(i) {
  if (currentMode !== 'edit') return;
  const s = getS();
  if (!s) return;
  
  let arr = s.blocchi;
  if (i === arr.length - 1) return;
  
  [arr[i], arr[i+1]] = [arr[i+1], arr[i]];
  saveLocal();
  renderScheda();
}

// ELIMINA
function del(i) {
  if (currentMode !== 'edit') return;
  const s = getS();
  if (!s) return;
  
  s.blocchi.splice(i, 1);
  saveLocal();
  renderScheda();
}

// RINOMINA
function rename(v) {
  if (currentMode !== 'edit') return;
  const s = getS();
  if (s) {
    s.nome = v;
    saveLocal();
  }
}

// ELENCO SCHEDE
function elencoSchede() {
  toolbar(false);

  app.innerHTML = `
    <div style="padding:20px;">
      <h2 style="color:var(--text-light)">Le tue schede</h2>
      ${schede.map(s => `
        <div class="card">
          <div class="card-title">${escapeHtml(s.nome || 'SCHEDA')}</div>
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

function apri(id) {
  attiva = id;
  
  // Reset delle variabili visive quando si apre una scheda
  const s = getS();
  if (s) {
    // Non modificare i dati della scheda
  }
  
  renderScheda();
}

function copia(id) {
  if (currentMode !== 'edit') return;
  const s = schede.find(x => x.id === id);
  if (!s) return;
  
  // Crea una copia profonda
  const nuova = JSON.parse(JSON.stringify(s));
  nuova.id = Date.now();
  nuova.nome = (s.nome || 'SCHEDA') + " (copia)";
  schede.push(nuova);
  saveLocal();
  elencoSchede();
}

function eliminaScheda(id) {
  if (currentMode !== 'edit') return;
  if (!confirm('Eliminare questa scheda?')) return;
  schede = schede.filter(s => s.id !== id);
  if (attiva === id) attiva = null;
  saveLocal();
  elencoSchede();
}

// SALVATAGGIO CLOUD - SOLO QUANDO CHIAMATO ESPLICITAMENTE
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
  if (!s) return;
  
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(s.nome)}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .marker { height: 4px; padding: 0; }
        .spacer { height: 15px; background: #f0f0f0; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(s.nome)}</h1>
  `;
  
  if (showJammer || showDX || showSX) {
    htmlContent += '<div style="margin: 10px 0;">';
    if (showJammer) {
      htmlContent += `<strong style="color: #FFD700;">${showJammer ? 'Si Jammer' : 'No Jammer'}</strong> `;
    }
    if (showDX) htmlContent += '<strong style="color: #87CEEB;">DX</strong> ';
    if (showSX) htmlContent += '<strong style="color: #87CEEB;">SX</strong>';
    htmlContent += '</div>';
  }
  
  htmlContent += `
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
          </tr>
        </thead>
        <tbody>
  `;
  
  s.blocchi.forEach(b => {
    if (b.type === 'marker') {
      htmlContent += `<tr><td colspan="7" class="marker" style="background:${b.color || '#4CAF50'}"></td></tr>`;
    } else if (b.type === 'spacer') {
      htmlContent += `<tr><td colspan="7" class="spacer"></td></tr>`;
    } else if (b.type === 'exercise') {
      for (let r = 0; r < (b.rows || 1); r++) {
        htmlContent += '<tr>';
        
        if (r === 0) {
          htmlContent += `<td rowspan="${b.rows || 1}">${escapeHtml(b.nome || '')}</td>`;
        }
        
        htmlContent += `<td>${escapeHtml((b.serie || [])[r] || '')}</td>`;
        
        if (r === 0) {
          htmlContent += `<td rowspan="${b.rows || 1}">${escapeHtml(b.rep || '')}</td>`;
        }
        
        htmlContent += `<td>${escapeHtml((b.kg || [])[r] || '')}</td>`;
        
        if (r === 0) {
          htmlContent += `<td rowspan="${b.rows || 1}">${escapeHtml(b.rec || '')}</td>`;
        }
        
        htmlContent += `
          <td>${escapeHtml(b.prog || '')}</td>
          <td>${escapeHtml(b.note || '')}</td>
        `;
        
        htmlContent += '</tr>';
      }
    }
  });
  
  htmlContent += `
        </tbody>
      </table>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  printWindow.onload = function() {
    printWindow.print();
  };
}

// SAVE LOCAL
function saveLocal() {
  localStorage.setItem("schede", JSON.stringify(schede));
}

// AVVIA APP
init();