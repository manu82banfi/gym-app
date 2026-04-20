// VARIABILI GLOBALI
let schede = [];
let attiva = null;
let currentMode = 'edit';
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

// RENDER SCHEDA COMPLETA
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
    <h2 contenteditable="${isEditMode}" oninput="rename(this.innerText)">${escapeHtml(s.nome || 'SCHEDA')}</h2>
    ${labelsHtml}
    <table>
      <thead>
        <tr>
          <th class="col-esercizio">ESERCIZIO</th>
          <th class="col-serie">SERIE</th>
          <th class="col-rep">REP</th>
          <th class="col-kg">KG</th>
          <th class="col-rec">REC</th>
          <th class="col-prog">PROG</th>
          <th class="col-note">NOTE</th>
          <th class="col-azioni"></th>
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
}

// RENDER SINGOLO BLOCCO - CON CLASSI SPECIFICHE
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
    
    const nome = b.nome || '';
    const rep = b.rep || '';
    const rec = b.rec || '';
    const serie = b.serie || [];
    const kg = b.kg || [];
    const prog = b.prog || [];
    const note = b.note || [];
    const numRows = b.rows || 1;

    for (let r = 0; r < numRows; r++) {
      rows += `<tr class="row-hover">`;

      // ESERCIZIO - rowspan con classe
      if (r === 0) {
        rows += `<td rowspan="${numRows}" class="col-esercizio">
          <input value="${escapeHtml(nome)}" data-field="nome" data-index="${i}"
          ${!isEditMode ? 'disabled' : ''}
          oninput="updateField(${i}, 'nome', this.value)">
        </td>`;
      }

      // SERIE - classe specifica
      rows += `
        <td class="col-serie">
          <input value="${escapeHtml(serie[r] || '')}" data-field="serie" data-index="${i}" data-row="${r}"
          ${!canEdit ? 'disabled' : ''}
          onkeydown="serieKey(event, ${i}, ${r})"
          oninput="updateArrayField(${i}, 'serie', ${r}, this.value)">
        </td>
      `;

      // REP - rowspan con classe
      if (r === 0) {
        rows += `<td rowspan="${numRows}" class="col-rep">
          <input value="${escapeHtml(rep)}" data-field="rep" data-index="${i}"
          ${!isEditMode ? 'disabled' : ''}
          oninput="updateField(${i}, 'rep', this.value)">
        </td>`;
      }

      // KG - classe specifica
      rows += `
        <td class="col-kg">
          <input value="${escapeHtml(kg[r] || '')}" data-field="kg" data-index="${i}" data-row="${r}"
          ${!canEdit ? 'disabled' : ''}
          oninput="updateArrayField(${i}, 'kg', ${r}, this.value)">
        </td>
      `;

      // REC - rowspan con classe
      if (r === 0) {
        rows += `<td rowspan="${numRows}" class="col-rec">
          <input value="${escapeHtml(rec)}" data-field="rec" data-index="${i}"
          ${!isEditMode ? 'disabled' : ''}
          oninput="updateField(${i}, 'rec', this.value)">
        </td>`;
      }

      // PROG - classe specifica
      rows += `
        <td class="col-prog">
          <input value="${escapeHtml(prog[r] || '')}" data-field="prog" data-index="${i}" data-row="${r}"
          ${currentMode === 'read' ? 'disabled' : ''}
          oninput="updateArrayField(${i}, 'prog', ${r}, this.value)">
        </td>
      `;

      // NOTE - classe specifica
      rows += `
        <td class="col-note">
          <input value="${escapeHtml(note[r] || '')}" data-field="note" data-index="${i}" data-row="${r}"
          ${currentMode === 'read' ? 'disabled' : ''}
          oninput="updateArrayField(${i}, 'note', ${r}, this.value)">
        </td>
      `;

      // AZIONI - rowspan
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

// UPDATE FUNCTIONS
function updateField(i, field, value) {
  if (currentMode === 'read') return;
  const s = getS();
  if (!s || !s.blocchi[i]) return;
  
  s.blocchi[i][field] = value;
  saveLocal();
}

function updateArrayField(i, field, row, value) {
  if (currentMode === 'read') return;
  const s = getS();
  if (!s || !s.blocchi[i]) return;
  
  if (!s.blocchi[i][field]) {
    s.blocchi[i][field] = [];
  }
  
  s.blocchi[i][field][row] = value;
  saveLocal();
}

// ENTER = nuova riga serie
function serieKey(e, i, r) {
  if (e.key === "Enter" && currentMode === 'edit') {
    e.preventDefault();
    const s = getS();
    if (!s) return;
    
    const blocco = s.blocchi[i];
    if (!blocco) return;
    
    if (!blocco.serie) blocco.serie = [];
    if (!blocco.kg) blocco.kg = [];
    if (!blocco.prog) blocco.prog = [];
    if (!blocco.note) blocco.note = [];
    
    blocco.serie.push("");
    blocco.kg.push("");
    blocco.prog.push("");
    blocco.note.push("");
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
    prog: Array(n).fill(""),
    note: Array(n).fill("")
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

// AGGIUNGI MARKER
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

// MOVIMENTO
function moveUp(i) {
  if (currentMode !== 'edit') return;
  const s = getS();
  if (!s) return;
  
  if (i === 0) return;
  [s.blocchi[i], s.blocchi[i-1]] = [s.blocchi[i-1], s.blocchi[i]];
  saveLocal();
  renderScheda();
}

function moveDown(i) {
  if (currentMode !== 'edit') return;
  const s = getS();
  if (!s) return;
  
  if (i === s.blocchi.length - 1) return;
  [s.blocchi[i], s.blocchi[i+1]] = [s.blocchi[i+1], s.blocchi[i]];
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
  renderScheda();
}

function copia(id) {
  if (currentMode !== 'edit') return;
  const s = schede.find(x => x.id === id);
  if (!s) return;
  
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
        th, td { border: 1px solid #ddd; padding: 8px; }
        th { background-color: #f2f2f2; }
        .marker { height: 4px; padding: 0; }
        .spacer { height: 15px; background: #f0f0f0; }
        .col-esercizio { text-align: left; }
        .col-serie { text-align: center; }
        .col-rep { text-align: center; }
        .col-kg { text-align: center; }
        .col-rec { text-align: center; }
        .col-prog { text-align: left; }
        .col-note { text-align: right; }
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
            <th class="col-esercizio">ESERCIZIO</th>
            <th class="col-serie">SERIE</th>
            <th class="col-rep">REP</th>
            <th class="col-kg">KG</th>
            <th class="col-rec">REC</th>
            <th class="col-prog">PROG</th>
            <th class="col-note">NOTE</th>
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
      const numRows = b.rows || 1;
      const prog = b.prog || [];
      const note = b.note || [];
      
      for (let r = 0; r < numRows; r++) {
        htmlContent += '<tr>';
        
        if (r === 0) {
          htmlContent += `<td rowspan="${numRows}" class="col-esercizio">${escapeHtml(b.nome || '')}</td>`;
        }
        
        htmlContent += `<td class="col-serie">${escapeHtml((b.serie || [])[r] || '')}</td>`;
        
        if (r === 0) {
          htmlContent += `<td rowspan="${numRows}" class="col-rep">${escapeHtml(b.rep || '')}</td>`;
        }
        
        htmlContent += `<td class="col-kg">${escapeHtml((b.kg || [])[r] || '')}</td>`;
        
        if (r === 0) {
          htmlContent += `<td rowspan="${numRows}" class="col-rec">${escapeHtml(b.rec || '')}</td>`;
        }
        
        htmlContent += `
          <td class="col-prog">${escapeHtml(prog[r] || '')}</td>
          <td class="col-note">${escapeHtml(note[r] || '')}</td>
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