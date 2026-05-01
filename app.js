// VARIABILI GLOBALI
let schede = [];
let attiva = null;
let currentMode = 'edit';

// INIT
async function init() {
  const cloud = await caricaCloud();

  if (cloud && cloud.length) {
    schede = cloud;
    schede.forEach(s => {
      if (s.showJammer === undefined) s.showJammer = false;
      if (s.showDX === undefined) s.showDX = false;
      if (s.showSX === undefined) s.showSX = false;
    });
    saveLocal();
  } else {
    const local = localStorage.getItem("schede");
    if (local) {
      schede = JSON.parse(local);
      schede.forEach(s => {
        if (s.showJammer === undefined) s.showJammer = false;
        if (s.showDX === undefined) s.showDX = false;
        if (s.showSX === undefined) s.showSX = false;
      });
    }
  }

  renderHome();
  updateModeUI();
  updateMobileModeUI();
}

// HOME
function renderHome() {
  toolbar(false);
  mobileInsertToolbar(false);
  app.innerHTML = "<div class='home'>Seleziona o crea una scheda</div>";
}

// TOOLBAR VISIBILITÀ - DESKTOP
function toolbar(show) {
  const toolbarContainer = document.getElementById("toolbarContainer");
  if (toolbarContainer) {
    if (show) {
      toolbarContainer.classList.remove("hidden");
    } else {
      toolbarContainer.classList.add("hidden");
    }
  }
}

// TOOLBAR MOBILE INSERT
function mobileInsertToolbar(show) {
  const container = document.getElementById("mobileInsertContainer");
  if (container) {
    if (show) {
      container.classList.remove("hidden");
    } else {
      container.classList.add("hidden");
    }
  }
  updateMobileInsertMenu();
}

// GESTIONE MODALITÀ
function setMode(mode) {
  currentMode = mode;
  updateModeUI();
  updateMobileModeUI();
  
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
  const modeEl = document.getElementById(`mode-${currentMode}`);
  if (modeEl) modeEl.classList.add('active');
  
  const buttons = document.querySelectorAll('.main-buttons button:not(.mode-option)');
  
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

function updateMobileModeUI() {
  ['read', 'edit', 'train'].forEach(m => {
    const el = document.getElementById(`mobile-mode-${m}`);
    if (el) {
      if (m === currentMode) {
        el.classList.add('active-mobile');
      } else {
        el.classList.remove('active-mobile');
      }
    }
  });
}

// TOGGLE PER DROPDOWN ESERCIZI
function toggleExerciseDropdown() {
  if (currentMode !== 'edit') return;
  const dropdown = document.getElementById('exerciseDropdown');
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

// NUOVA SCHEDA
function nuovaScheda() {
  if (currentMode !== 'edit') return;
  
  const s = {
    id: Date.now(),
    nome: "NUOVA SCHEDA",
    blocchi: [],
    showJammer: false,
    showDX: false,
    showSX: false
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
  mobileInsertToolbar(true);
  const s = getS();
  
  if (!s) {
    renderHome();
    return;
  }
  
  if (s.showJammer === undefined) s.showJammer = false;
  if (s.showDX === undefined) s.showDX = false;
  if (s.showSX === undefined) s.showSX = false;
  
  const isEditMode = currentMode === 'edit';
  const isTrainMode = currentMode === 'train';
  const canEdit = isEditMode || isTrainMode;

  let labelsHtml = '<div class="labels-container">';
  
  if (s.showJammer) {
    labelsHtml += `<span class="jammer-label">✅ Jammer Attivo</span>`;
  } else {
    labelsHtml += `<span class="jammer-label">❌ Jammer Non Attivo</span>`;
  }
  
  if (s.showDX) labelsHtml += '<span class="side-label">✔️ DX</span>';
  if (s.showSX) labelsHtml += '<span class="side-label">✔️ SX</span>';
  
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
  updateMobileInsertMenu();
}

// RENDER SINGOLO BLOCCO
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
      rows += `<tr>`;

      if (r === 0) {
        rows += `<td rowspan="${numRows}" class="col-esercizio">
          <input value="${escapeHtml(nome)}" data-field="nome" data-index="${i}"
          ${!isEditMode ? 'disabled' : ''}
          oninput="updateField(${i}, 'nome', this.value)">
         </td>`;
      }

      rows += `
        <td class="col-serie">
          <input value="${escapeHtml(serie[r] || '')}" data-field="serie" data-index="${i}" data-row="${r}"
          ${!canEdit ? 'disabled' : ''}
          onkeydown="serieKey(event, ${i}, ${r})"
          oninput="updateArrayField(${i}, 'serie', ${r}, this.value)">
         </td>
      `;

      if (r === 0) {
        rows += `<td rowspan="${numRows}" class="col-rep">
          <input value="${escapeHtml(rep)}" data-field="rep" data-index="${i}"
          ${!isEditMode ? 'disabled' : ''}
          oninput="updateField(${i}, 'rep', this.value)">
         </td>`;
      }

      rows += `
        <td class="col-kg">
          <input value="${escapeHtml(kg[r] || '')}" data-field="kg" data-index="${i}" data-row="${r}"
          ${!canEdit ? 'disabled' : ''}
          oninput="updateArrayField(${i}, 'kg', ${r}, this.value)">
         </td>
      `;

      if (r === 0) {
        rows += `<td rowspan="${numRows}" class="col-rec">
          <input value="${escapeHtml(rec)}" data-field="rec" data-index="${i}"
          ${!isEditMode ? 'disabled' : ''}
          oninput="updateField(${i}, 'rec', this.value)">
         </td>`;
      }

      rows += `
        <td class="col-prog">
          <input value="${escapeHtml(prog[r] || '')}" data-field="prog" data-index="${i}" data-row="${r}"
          ${currentMode === 'read' ? 'disabled' : ''}
          oninput="updateArrayField(${i}, 'prog', ${r}, this.value)">
         </td>
      `;

      rows += `
        <td class="col-note">
          <input value="${escapeHtml(note[r] || '')}" data-field="note" data-index="${i}" data-row="${r}"
          ${currentMode === 'read' ? 'disabled' : ''}
          oninput="updateArrayField(${i}, 'note', ${r}, this.value)">
         </td>
      `;

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

function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
  
  const dropdown = document.getElementById('exerciseDropdown');
  if (dropdown) dropdown.classList.add('hidden');
}

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

function addMarkerFromDropdown(color, muscolo) {
  if (currentMode !== 'edit') return;
  
  const s = getS();
  if (!s) return;
  
  s.blocchi.push({
    type: "marker",
    color: color,
    muscolo: muscolo
  });
  
  const markerDropdown = document.getElementById('markerDropdown');
  if (markerDropdown) markerDropdown.classList.add('hidden');
  
  saveLocal();
  renderScheda();
}

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
  const s = getS();
  if (!s) return;
  
  s.showJammer = !s.showJammer;
  updateJammerButton();
  saveLocal();
  if (attiva) renderScheda();
}

function updateJammerButton() {
  const s = getS();
  const btn = document.getElementById('jammerToggle');
  if (btn && s) {
    btn.textContent = s.showJammer ? 'Si Jammer' : 'No Jammer';
    btn.className = `toggle-btn ${s.showJammer ? 'on' : 'off'}`;
  }
}

// UPDATE LABELS DX/SX
function updateSideLabels() {
  if (currentMode !== 'edit') return;
  const s = getS();
  if (!s) return;
  
  const checkDX = document.getElementById('checkDX');
  const checkSX = document.getElementById('checkSX');
  
  if (checkDX.checked) {
    checkSX.checked = false;
    s.showDX = true;
    s.showSX = false;
  } else if (checkSX.checked) {
    checkDX.checked = false;
    s.showDX = false;
    s.showSX = true;
  } else {
    s.showDX = false;
    s.showSX = false;
  }
  
  saveLocal();
  if (attiva) renderScheda();
}

function updateCheckboxState() {
  const s = getS();
  const checkDX = document.getElementById('checkDX');
  const checkSX = document.getElementById('checkSX');
  
  if (checkDX && checkSX && s) {
    checkDX.checked = s.showDX || false;
    checkSX.checked = s.showSX || false;
    checkDX.disabled = (currentMode === 'train' || currentMode === 'read');
    checkSX.disabled = (currentMode === 'train' || currentMode === 'read');
  }
}

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

function del(i) {
  if (currentMode !== 'edit') return;
  const s = getS();
  if (!s) return;
  
  s.blocchi.splice(i, 1);
  saveLocal();
  renderScheda();
}

function rename(v) {
  if (currentMode !== 'edit') return;
  const s = getS();
  if (s) {
    s.nome = v;
    saveLocal();
  }
}

function elencoSchede() {
  toolbar(false);
  mobileInsertToolbar(false);

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
  
  if (s.showJammer || s.showDX || s.showSX) {
    htmlContent += '<div style="margin: 10px 0;">';
    if (s.showJammer) {
      htmlContent += `<strong style="color: #FFD700;">Si Jammer</strong> `;
    }
    if (s.showDX) htmlContent += '<strong style="color: #87CEEB;">DX</strong> ';
    if (s.showSX) htmlContent += '<strong style="color: #87CEEB;">SX</strong>';
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

function saveLocal() {
  localStorage.setItem("schede", JSON.stringify(schede));
}

// ============================================
// FUNZIONI MOBILE - 3 MENU SEPARATI
// ============================================

// --- MENU AZIONI (☰ a sinistra) ---
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const modeMenu = document.getElementById('mobileModeMenu');
  const insertMenu = document.getElementById('mobileInsertMenu');
  
  // Chiudi gli altri menu se aperti
  if (modeMenu && !modeMenu.classList.contains('hidden')) {
    modeMenu.classList.add('hidden');
  }
  if (insertMenu && !insertMenu.classList.contains('hidden')) {
    insertMenu.classList.add('hidden');
  }
  
  if (menu) {
    menu.classList.toggle('hidden');
    
    if (!menu.classList.contains('hidden')) {
      setTimeout(() => {
        document.addEventListener('click', function closeMobileMenuHandler(e) {
          if (!e.target.closest('.mobile-menu')) {
            menu.classList.add('hidden');
            document.removeEventListener('click', closeMobileMenuHandler);
          }
        });
      }, 100);
    }
  }
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) {
    menu.classList.add('hidden');
  }
}

// --- MENU MODALITÀ (◉ al centro) ---
function toggleMobileModeMenu() {
  const menu = document.getElementById('mobileModeMenu');
  const actionMenu = document.getElementById('mobileMenu');
  const insertMenu = document.getElementById('mobileInsertMenu');
  
  // Chiudi gli altri menu se aperti
  if (actionMenu && !actionMenu.classList.contains('hidden')) {
    actionMenu.classList.add('hidden');
  }
  if (insertMenu && !insertMenu.classList.contains('hidden')) {
    insertMenu.classList.add('hidden');
  }
  
  if (menu) {
    menu.classList.toggle('hidden');
    updateMobileModeUI();
    
    if (!menu.classList.contains('hidden')) {
      setTimeout(() => {
        document.addEventListener('click', function closeModeMenuHandler(e) {
          if (!e.target.closest('.mobile-mode-menu')) {
            menu.classList.add('hidden');
            document.removeEventListener('click', closeModeMenuHandler);
          }
        });
      }, 100);
    }
  }
}

function closeMobileModeMenu() {
  const menu = document.getElementById('mobileModeMenu');
  if (menu) {
    menu.classList.add('hidden');
  }
}

// --- MENU INSERISCI (✚ a destra) ---
function toggleMobileInsert() {
  if (currentMode !== 'edit') return;
  
  const menu = document.getElementById('mobileInsertMenu');
  const actionMenu = document.getElementById('mobileMenu');
  const modeMenu = document.getElementById('mobileModeMenu');
  
  // Chiudi gli altri menu se aperti
  if (actionMenu && !actionMenu.classList.contains('hidden')) {
    actionMenu.classList.add('hidden');
  }
  if (modeMenu && !modeMenu.classList.contains('hidden')) {
    modeMenu.classList.add('hidden');
  }
  
  if (menu) {
    menu.classList.toggle('hidden');
    
    if (!menu.classList.contains('hidden')) {
      updateMobileInsertMenu();
      setTimeout(() => {
        document.addEventListener('click', function closeInsertMenuHandler(e) {
          if (!e.target.closest('.mobile-insert')) {
            menu.classList.add('hidden');
            document.removeEventListener('click', closeInsertMenuHandler);
          }
        });
      }, 100);
    }
  }
}

function closeMobileInsert() {
  const menu = document.getElementById('mobileInsertMenu');
  if (menu) {
    menu.classList.add('hidden');
  }
}

function updateMobileInsertMenu() {
  const s = getS();
  
  const jammerText = document.getElementById('mobile-jammer-text');
  if (jammerText && s) {
    jammerText.textContent = s.showJammer ? '🔧 Jammer: Sì' : '🔧 Jammer: No';
  }
  
  const dxText = document.getElementById('mobile-dx-text');
  if (dxText && s) {
    dxText.textContent = s.showDX ? '☑ DX' : '☐ DX';
  }
  
  const sxText = document.getElementById('mobile-sx-text');
  if (sxText && s) {
    sxText.textContent = s.showSX ? '☑ SX' : '☐ SX';
  }
}

function toggleDX() {
  if (currentMode !== 'edit') return;
  const s = getS();
  if (!s) return;
  
  s.showDX = !s.showDX;
  if (s.showDX) s.showSX = false;
  saveLocal();
  if (attiva) renderScheda();
}

function toggleSX() {
  if (currentMode !== 'edit') return;
  const s = getS();
  if (!s) return;
  
  s.showSX = !s.showSX;
  if (s.showSX) s.showDX = false;
  saveLocal();
  if (attiva) renderScheda();
}

init();