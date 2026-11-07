// VARIABILI GLOBALI
let schede = [];
let catalogo = [];              // Catalogo esercizi (editabile)
let attiva = null;
let currentMode = 'edit';
let filtroMuscolo = 'Tutti';    // Stato filtro pagina esercizi
let esercizioInModifica = null; // Per il form esercizio (null = nuovo)

// ============================================
// CONFIGURAZIONE MARKER (unico punto di verità)
// ============================================
const MARKERS = [
  { color: '#2582e6', nome: 'Petto',       textColor: 'white' },
  { color: '#4CAF50', nome: 'Bicipiti',    textColor: 'white' },
  { color: '#f44336', nome: 'Tricipiti',   textColor: 'white' },
  { color: '#fa8405', nome: 'Addominali',  textColor: 'white' },
  { color: '#8f0663', nome: 'Gambe',       textColor: 'white' },
  { color: '#cccccc', nome: 'Dorso',       textColor: 'black' },
  { color: '#FFEB3B', nome: 'Spalle',      textColor: 'black' }
];

// ============================================
// UTILITY
// ============================================
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Sceglie colore testo (bianco o nero) in base allo sfondo esadecimale
function getTextColorForBg(bg) {
  if (!bg || bg[0] !== '#') return '#fff';
  const c = bg.replace('#', '');
  if (c.length !== 6) return '#fff';
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#000' : '#fff';
}

// ============================================
// MARKER DROPDOWN
// ============================================
function renderMarkerDropdown() {
  const box = document.getElementById('markerDropdown');
  if (!box) return;
  box.innerHTML = MARKERS.map(m => `
    <div onclick="addMarkerFromDropdown('${m.color}', '${m.nome}')"
         style="background:${m.color}; color:${m.textColor}">${m.nome}</div>
  `).join('');
}

function renderMobileMarkerItems() {
  const box = document.getElementById('mobileMarkerItems');
  if (!box) return;
  box.innerHTML = MARKERS.map(m => `
    <div onclick="addMarkerFromDropdown('${m.color}', '${m.nome}'); closeMobileInsert()"
         style="background:${m.color}; color:${m.textColor}">${m.nome}</div>
  `).join('');
}

// ============================================
// INIT
// ============================================
async function init() {
  renderMarkerDropdown();
  renderMobileMarkerItems();

  const cloud = await caricaCloud();

  // Riconosce formato vecchio (solo schede = array) e nuovo ({schede, catalogo})
  const cloudIsOldFormat = Array.isArray(cloud);
  const cloudHasData = cloud && (
    (cloudIsOldFormat && cloud.length > 0) ||
    (!cloudIsOldFormat && (cloud.schede || cloud.catalogo))
  );

  if (cloudHasData) {
    if (cloudIsOldFormat) {
      schede = cloud;
      catalogo = JSON.parse(JSON.stringify(CATALOGO_DEFAULT));
    } else {
      schede = cloud.schede || [];
      catalogo = cloud.catalogo || JSON.parse(JSON.stringify(CATALOGO_DEFAULT));
    }
    schede.forEach(s => {
      if (s.showJammer === undefined) s.showJammer = false;
      if (s.showDX === undefined) s.showDX = false;
      if (s.showSX === undefined) s.showSX = false;
    });
    saveLocal();
  } else {
    const local = localStorage.getItem("schede");
    if (local) {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed)) {
        schede = parsed;
      } else {
        schede = parsed.schede || [];
        if (parsed.catalogo && parsed.catalogo.length) catalogo = parsed.catalogo;
      }
      schede.forEach(s => {
        if (s.showJammer === undefined) s.showJammer = false;
        if (s.showDX === undefined) s.showDX = false;
        if (s.showSX === undefined) s.showSX = false;
      });
    }
    if (!catalogo || catalogo.length === 0) {
      catalogo = JSON.parse(JSON.stringify(CATALOGO_DEFAULT));
    }
  }

  renderHome();
  updateModeUI();
  updateMobileModeUI();
}

// ============================================
// HOME
// ============================================
function renderHome() {
  toolbar(false);
  mobileInsertToolbar(false);

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="home-screen">
      <button class="home-tile" onclick="vaiAllenamento()">
        <img src="img/allenamento.png" alt="Allenamento"
             onerror="this.style.display='none'; this.parentElement.classList.add('no-img')">
        <span class="home-tile-label">Allenamento</span>
      </button>
      <button class="home-tile" onclick="vaiCreaScheda()">
        <img src="img/crea-scheda.png" alt="Crea scheda"
             onerror="this.style.display='none'; this.parentElement.classList.add('no-img')">
        <span class="home-tile-label">Crea scheda</span>
      </button>
      <button class="home-tile" onclick="vaiEsercizi()">
        <img src="img/esercizi.png" alt="Esercizi"
             onerror="this.style.display='none'; this.parentElement.classList.add('no-img')">
        <span class="home-tile-label">Esercizi</span>
      </button>
    </div>
  `;
}

function vaiAllenamento() {
  setMode('train');
  elencoSchede();
}

function vaiCreaScheda() {
  setMode('edit');
  nuovaScheda();
}

function vaiEsercizi() {
  filtroMuscolo = 'Tutti';
  renderEsercizi();
}

function tornaHome() {
  attiva = null;
  setMode('edit');
  renderHome();
  updateModeUI();
  updateMobileModeUI();
}

// ============================================
// TOOLBAR
// ============================================
function toolbar(show) {
  const toolbarContainer = document.getElementById("toolbarContainer");
  if (toolbarContainer) {
    if (show) toolbarContainer.classList.remove("hidden");
    else toolbarContainer.classList.add("hidden");
  }
}

function mobileInsertToolbar(show) {
  const container = document.getElementById("mobileInsertContainer");
  if (container) {
    if (show) container.classList.remove("hidden");
    else container.classList.add("hidden");
  }
  updateMobileInsertMenu();
}

// ============================================
// MODALITÀ
// ============================================
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
  document.querySelectorAll('.mode-option').forEach(el => el.classList.remove('active'));
  const modeEl = document.getElementById(`mode-${currentMode}`);
  if (modeEl) modeEl.classList.add('active');

  const buttons = document.querySelectorAll('.main-buttons button:not(.mode-option)');

  if (currentMode === 'read') {
    buttons.forEach(btn => {
      const text = btn.textContent;
      // In lettura sono abilitati solo Home, Esercizi, Elenco
      btn.disabled = !(text.includes('Home') || text.includes('Esercizi') || text.includes('Elenco'));
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
      if (m === currentMode) el.classList.add('active-mobile');
      else el.classList.remove('active-mobile');
    }
  });
}

// ============================================
// PAGINA ESERCIZI
// ============================================
function renderEsercizi() {
  toolbar(false);
  mobileInsertToolbar(false);

  const listaFiltrata = filtroMuscolo === 'Tutti'
    ? catalogo
    : catalogo.filter(e => e.muscolo === filtroMuscolo);

  const chips = ['Tutti', ...MUSCOLI].map(m => `
    <button class="muscolo-chip ${m === filtroMuscolo ? 'active' : ''}"
            onclick="setFiltroMuscolo('${m}')">${m}</button>
  `).join('');

  const cards = listaFiltrata.length === 0
    ? `<p class="esercizi-empty">Nessun esercizio in questa categoria.</p>`
    : listaFiltrata.map(e => renderEsercizioCard(e, false)).join('');

  app.innerHTML = `
    <div class="esercizi-page">
      <div class="esercizi-header">
        <h2>Esercizi (${listaFiltrata.length})</h2>
        ${currentMode === 'edit' ? `<button onclick="mostraFormEsercizio()">➕ Nuovo esercizio</button>` : ''}
      </div>
      <div class="filtro-muscoli">${chips}</div>
      <div class="esercizi-grid">${cards}</div>
    </div>
  `;
}

function setFiltroMuscolo(m) {
  filtroMuscolo = m;
  renderEsercizi();
}

// Card esercizio riutilizzabile (selezionabile = onclick aggiunge alla scheda)
function renderEsercizioCard(e, selezionabile) {
  const colore = MUSCOLI_COLORI[e.muscolo] || '#666';
  const textColor = getTextColorForBg(colore);
  const onclick = selezionabile
    ? `onclick="mostraSceltaRighe('${e.id}')"`
    : `onclick="renderDettaglioEsercizio('${e.id}')"`;

  const thumb = e.foto
    ? `<img src="${escapeHtml(e.foto)}" alt="${escapeHtml(e.nome)}" onerror="this.style.display='none'; this.parentElement.classList.add('no-img'); this.parentElement.innerHTML='<span>${escapeHtml(e.muscolo)}</span>'">`
    : `<span>${escapeHtml(e.muscolo)}</span>`;

  return `
    <div class="esercizio-card ${selezionabile ? 'selezionabile' : ''}" ${onclick}>
      <div class="esercizio-thumb ${e.foto ? '' : 'no-img'}">${thumb}</div>
      <div class="esercizio-card-body">
        <div class="esercizio-nome">${escapeHtml(e.nome)}</div>
        <span class="muscolo-badge" style="background:${colore}; color:${textColor}">${escapeHtml(e.muscolo)}</span>
      </div>
    </div>
  `;
}

// ============================================
// DETTAGLIO ESERCIZIO
// ============================================
function renderDettaglioEsercizio(id) {
  toolbar(false);
  mobileInsertToolbar(false);

  const ex = catalogo.find(e => e.id === id);
  if (!ex) { renderEsercizi(); return; }

  const colore = MUSCOLI_COLORI[ex.muscolo] || '#666';
  const textColor = getTextColorForBg(colore);
  const fotoHtml = ex.foto
    ? `<img class="dettaglio-foto" src="${escapeHtml(ex.foto)}" alt="${escapeHtml(ex.nome)}" onerror="this.style.display='none'; this.parentElement.classList.add('no-img'); this.parentElement.innerHTML='<span>${escapeHtml(ex.muscolo)}</span>'">`
    : `<div class="dettaglio-foto no-img"><span>${escapeHtml(ex.muscolo)}</span></div>`;

  app.innerHTML = `
    <div class="esercizio-dettaglio">
      <button onclick="renderEsercizi()">← Indietro</button>
      <div class="dettaglio-body">
        ${fotoHtml}
        <div class="dettaglio-info">
          <h2>${escapeHtml(ex.nome)}</h2>
          <span class="muscolo-badge" style="background:${colore}; color:${textColor}">${escapeHtml(ex.muscolo)}</span>
          ${ex.note ? `<p class="dettaglio-note">${escapeHtml(ex.note)}</p>` : ''}
          ${currentMode === 'edit' ? `
            <div class="dettaglio-actions">
              <button onclick="mostraFormEsercizio('${ex.id}')">✏️ Modifica</button>
              <button onclick="eliminaEsercizio('${ex.id}')" class="btn-danger">🗑 Elimina</button>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// ============================================
// FORM CREA/MODIFICA ESERCIZIO
// ============================================
function mostraFormEsercizio(id) {
  if (currentMode !== 'edit') return;

  const ex = id ? catalogo.find(e => e.id === id) : null;
  esercizioInModifica = ex ? ex.id : null;

  const opzioniMuscoli = MUSCOLI.map(m =>
    `<option value="${m}" ${ex && ex.muscolo === m ? 'selected' : ''}>${m}</option>`
  ).join('');

  const backAction = ex ? `renderDettaglioEsercizio('${ex.id}')` : `renderEsercizi()`;

  app.innerHTML = `
    <div class="esercizio-form-page">
      <button onclick="${backAction}">← Annulla</button>
      <h2>${ex ? 'Modifica esercizio' : 'Nuovo esercizio'}</h2>
      <form onsubmit="salvaEsercizio(event)" class="form-esercizio">
        <label>Nome *
          <input type="text" id="ex-nome" value="${ex ? escapeHtml(ex.nome) : ''}" required>
        </label>
        <label>Gruppo muscolare *
          <select id="ex-muscolo" required>
            <option value="">— Seleziona —</option>
            ${opzioniMuscoli}
          </select>
        </label>
        <label>Carica foto (verrà ridimensionata)
          <input type="file" accept="image/*" id="ex-foto-file" onchange="anteprimaFoto(event)">
        </label>
        <label>Oppure percorso/URL foto
          <input type="text" id="ex-foto-url" value="${ex ? escapeHtml(ex.foto) : ''}" placeholder="img/esercizi/nome.jpg">
        </label>
        <div id="ex-foto-preview" class="foto-preview">${ex && ex.foto ? `<img src="${escapeHtml(ex.foto)}">` : ''}</div>
        <label>Note (opzionale)
          <textarea id="ex-note" rows="3">${ex ? escapeHtml(ex.note || '') : ''}</textarea>
        </label>
        <button type="submit" class="btn-primary">💾 Salva</button>
      </form>
    </div>
  `;
}

// Ridimensiona e comprime l'immagine caricata (JPEG, max 600px, qualità 0.75)
function anteprimaFoto(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const MAX = 600;
      let w = img.width, h = img.height;
      if (w > MAX) { h = h * MAX / w; w = MAX; }
      if (h > MAX) { w = w * MAX / h; h = MAX; }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', 0.75);
      const preview = document.getElementById('ex-foto-preview');
      preview.innerHTML = `<img src="${base64}">`;
      preview.dataset.base64 = base64;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function salvaEsercizio(event) {
  event.preventDefault();
  if (currentMode !== 'edit') return;

  const nome = document.getElementById('ex-nome').value.trim();
  const muscolo = document.getElementById('ex-muscolo').value;
  const note = document.getElementById('ex-note').value.trim();
  const fotoUrl = document.getElementById('ex-foto-url').value.trim();
  const preview = document.getElementById('ex-foto-preview');
  const fotoBase64 = preview.dataset.base64 || '';

  if (!nome || !muscolo) {
    alert('Nome e gruppo muscolare sono obbligatori');
    return;
  }

  // L'upload base64 vince sul campo URL
  const foto = fotoBase64 || fotoUrl;

  if (esercizioInModifica) {
    const ex = catalogo.find(e => e.id === esercizioInModifica);
    if (!ex) return;
    ex.nome = nome;
    ex.muscolo = muscolo;
    ex.note = note;
    ex.foto = foto;
    saveLocal();
    alert('✅ Esercizio aggiornato');
    renderDettaglioEsercizio(ex.id);
  } else {
    // Genera ID univoco slug
    const baseId = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'esercizio';
    let id = baseId;
    let counter = 1;
    while (catalogo.find(e => e.id === id)) id = `${baseId}-${counter++}`;

    catalogo.push({ id, nome, muscolo, foto, note });
    saveLocal();
    alert('✅ Esercizio creato');
    renderEsercizi();
  }
}

function eliminaEsercizio(id) {
  if (currentMode !== 'edit') return;
  if (!confirm('Eliminare questo esercizio?\nLe schede che lo usano mostreranno "[esercizio rimosso]".')) return;

  catalogo = catalogo.filter(e => e.id !== id);
  saveLocal();
  renderEsercizi();
}

// ============================================
// SELETTORE ESERCIZIO (per importare in scheda)
// ============================================
function apriSelettoreEsercizio() {
  if (currentMode !== 'edit') return;
  toolbar(false);

  const listaFiltrata = filtroMuscolo === 'Tutti'
    ? catalogo
    : catalogo.filter(e => e.muscolo === filtroMuscolo);

  const chips = ['Tutti', ...MUSCOLI].map(m => `
    <button class="muscolo-chip ${m === filtroMuscolo ? 'active' : ''}"
            onclick="setFiltroMuscoloSelettore('${m}')">${m}</button>
  `).join('');

  const cards = listaFiltrata.map(e => renderEsercizioCard(e, true)).join('');

  app.innerHTML = `
    <div class="esercizi-page">
      <div class="esercizi-header">
        <button onclick="renderScheda()">← Annulla</button>
        <h2>Seleziona esercizio</h2>
      </div>
      <div class="filtro-muscoli">${chips}</div>
      <div class="esercizi-grid">
        <div class="esercizio-card selezionabile" onclick="aggiungiEsercizioLibero()">
          <div class="esercizio-thumb no-img"><span>✏️</span></div>
          <div class="esercizio-card-body">
            <div class="esercizio-nome">Esercizio libero</div>
            <span class="muscolo-badge" style="background:#555; color:#fff">Scrivi a mano</span>
          </div>
        </div>
        ${cards || ''}
      </div>
    </div>
  `;
}

function setFiltroMuscoloSelettore(m) {
  filtroMuscolo = m;
  apriSelettoreEsercizio();
}

function mostraSceltaRighe(esercizioId) {
  const n = prompt('Quante righe (serie)? (default 1, max 10)', '1');
  if (n === null) return;
  const num = Math.max(1, Math.min(10, parseInt(n) || 1));
  aggiungiEsercizioDaCatalogo(esercizioId, num);
}

function aggiungiEsercizioDaCatalogo(esercizioId, n) {
  if (currentMode !== 'edit') return;
  const s = getS();
  if (!s) return;
  const ex = catalogo.find(e => e.id === esercizioId);
  if (!ex) return;

  const nuovo = {
    type: "exercise",
    esercizioId: esercizioId,
    nome: ex.nome,  // mantenuto per retrocompatibilità
    rows: n || 1,
    serie: Array(n || 1).fill(""),
    kg: Array(n || 1).fill(""),
    rep: "",
    rec: "",
    prog: Array(n || 1).fill(""),
    note: Array(n || 1).fill("")
  };

  s.blocchi.push(nuovo);
  saveLocal();
  renderScheda();
}

function aggiungiEsercizioLibero() {
  const n = prompt('Quante righe (serie)? (default 1, max 10)', '1');
  if (n === null) return;
  const num = Math.max(1, Math.min(10, parseInt(n) || 1));
  addExercise(num);  // riusa la funzione esistente
}

// ============================================
// HELPER BLOCCO ESERCIZIO
// ============================================
// Restituisce il nome visualizzato di un blocco esercizio
// (dal catalogo se ha esercizioId, altrimenti dal campo nome)
function getNomeBloccoEsercizio(b) {
  if (b.esercizioId) {
    const ex = catalogo.find(e => e.id === b.esercizioId);
    return ex ? ex.nome : (b.nome || '[esercizio rimosso]');
  }
  return b.nome || '';
}

// ============================================
// TOGGLE DROPDOWN ESERCIZI (desktop toolbar)
// ============================================
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

// ============================================
// NUOVA SCHEDA
// ============================================
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

function getS() {
  return schede.find(s => s.id === attiva);
}

// ============================================
// RENDER SCHEDA
// ============================================
function renderScheda() {
  toolbar(true);
  mobileInsertToolbar(true);
  const s = getS();

  if (!s) { renderHome(); return; }

  if (s.showJammer === undefined) s.showJammer = false;
  if (s.showDX === undefined) s.showDX = false;
  if (s.showSX === undefined) s.showSX = false;

  const isEditMode = currentMode === 'edit';
  const isTrainMode = currentMode === 'train';

  let labelsHtml = '<div class="labels-container">';
  if (s.showJammer) labelsHtml += `<span class="jammer-label">✅ Jammer Attivo</span>`;
  else labelsHtml += `<span class="jammer-label">❌ Jammer Non Attivo</span>`;
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

// ============================================
// RENDER BLOCCO
// ============================================
function renderBlocco(b, i, isEditMode, isTrainMode) {
  const canEdit = isEditMode || isTrainMode;
  const showActions = isEditMode;

  if (b.type === "marker") {
    return `<tr>
      <td colspan="7" class="marker" style="background:${b.color || 'var(--marker-bicipiti)'}; height:var(--marker-height); padding:0; border:none; line-height:0; font-size:0;"></td>
      ${showActions ? `<td class="actions" style="padding:0; border:none; height:var(--marker-height); line-height:0;">
        <span onclick="moveUp(${i})" style="font-size:10px;">↑</span>
        <span onclick="moveDown(${i})" style="font-size:10px;">↓</span>
        <span onclick="del(${i})" style="font-size:10px;">✕</span>
       </td>` : `<td style="padding:0; border:none; height:var(--marker-height);"></td>`}
    </tr>`;
  }

  if (b.type === "spacer") {
    return `<tr>
      <td colspan="7" class="spacer" style="height:15px; padding:0; background:var(--bg-dark); border:none;"></td>
      ${showActions ? `<td class="actions" style="padding:0; border:none; height:15px;">
        <span onclick="moveUp(${i})" style="font-size:10px;">↑</span>
        <span onclick="moveDown(${i})" style="font-size:10px;">↓</span>
        <span onclick="del(${i})" style="font-size:10px;">✕</span>
       </td>` : `<td style="padding:0; border:none; height:15px;"></td>`}
    </tr>`;
  }

  if (b.type === "exercise") {
    let rows = "";

    const nome = getNomeBloccoEsercizio(b);
    const rep = b.rep || '';
    const rec = b.rec || '';
    const serie = b.serie || [];
    const kg = b.kg || [];
    const prog = b.prog || [];
    const note = b.note || [];
    const numRows = b.rows || 1;
    const isCatalogExercise = !!b.esercizioId;

    for (let r = 0; r < numRows; r++) {
      rows += `<tr>`;

      if (r === 0) {
        // Se dal catalogo: nome read-only. Se libero: editabile in edit mode.
        const nomeDisabilitato = !isEditMode || isCatalogExercise;
        const nomeOninput = isCatalogExercise ? '' : `oninput="updateField(${i}, 'nome', this.value)"`;
        rows += `<td rowspan="${numRows}" class="col-esercizio">
          <input value="${escapeHtml(nome)}" data-field="nome" data-index="${i}"
          ${nomeDisabilitato ? 'disabled' : ''} ${nomeOninput}>
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

// ============================================
// CRUD CAMPI
// ============================================
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
  if (!s.blocchi[i][field]) s.blocchi[i][field] = [];
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
  s.blocchi.push({ type: "marker", color: color, muscolo: muscolo });
  const markerDropdown = document.getElementById('markerDropdown');
  if (markerDropdown) markerDropdown.classList.add('hidden');
  saveLocal();
  renderScheda();
}

function addSpacer() {
  if (currentMode !== 'edit') return;
  const s = getS();
  if (!s) return;
  s.blocchi.push({ type: "spacer" });
  saveLocal();
  renderScheda();
}

// ============================================
// JAMMER / DX / SX
// ============================================
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

// ============================================
// AZIONI BLOCCO
// ============================================
function moveUp(i) {
  if (currentMode !== 'edit') return;
  const s = getS();
  if (!s || i === 0) return;
  [s.blocchi[i], s.blocchi[i-1]] = [s.blocchi[i-1], s.blocchi[i]];
  saveLocal();
  renderScheda();
}

function moveDown(i) {
  if (currentMode !== 'edit') return;
  const s = getS();
  if (!s || i === s.blocchi.length - 1) return;
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
  if (s) { s.nome = v; saveLocal(); }
}

// ============================================
// ELENCO SCHEDE
// ============================================
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

// ============================================
// SALVATAGGIO (locale + cloud)
// ============================================
function saveLocal() {
  localStorage.setItem("schede", JSON.stringify({ schede, catalogo }));
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
      body: JSON.stringify({ schede, catalogo })
    });
    if (response.ok) alert('✅ Salvato nel cloud!');
    else throw new Error('Errore nel salvataggio');
  } catch (error) {
    alert('❌ Errore: ' + error.message);
  }
}

// ============================================
// EXPORT PDF
// ============================================
function exportPDF() {
  if (!attiva) { alert('Apri prima una scheda'); return; }
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
      </style>
    </head>
    <body>
      <h1>${escapeHtml(s.nome)}</h1>
  `;

  if (s.showJammer || s.showDX || s.showSX) {
    htmlContent += '<div style="margin: 10px 0;">';
    if (s.showJammer) htmlContent += `<strong style="color: #FFD700;">Si Jammer</strong> `;
    if (s.showDX) htmlContent += '<strong style="color: #87CEEB;">DX</strong> ';
    if (s.showSX) htmlContent += '<strong style="color: #87CEEB;">SX</strong>';
    htmlContent += '</div>';
  }

  htmlContent += `
      <table>
        <thead>
          <tr>
            <th>ESERCIZIO</th><th>SERIE</th><th>REP</th><th>KG</th>
            <th>REC</th><th>PROG</th><th>NOTE</th>
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
      const nome = getNomeBloccoEsercizio(b);
      for (let r = 0; r < numRows; r++) {
        htmlContent += '<tr>';
        if (r === 0) htmlContent += `<td rowspan="${numRows}">${escapeHtml(nome)}</td>`;
        htmlContent += `<td>${escapeHtml((b.serie || [])[r] || '')}</td>`;
        if (r === 0) htmlContent += `<td rowspan="${numRows}">${escapeHtml(b.rep || '')}</td>`;
        htmlContent += `<td>${escapeHtml((b.kg || [])[r] || '')}</td>`;
        if (r === 0) htmlContent += `<td rowspan="${numRows}">${escapeHtml(b.rec || '')}</td>`;
        htmlContent += `<td>${escapeHtml((b.prog || [])[r] || '')}</td>`;
        htmlContent += `<td>${escapeHtml((b.note || [])[r] || '')}</td>`;
        htmlContent += '</tr>';
      }
    }
  });

  htmlContent += `</tbody></table></body></html>`;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.onload = function() { printWindow.print(); };
}

// ============================================
// MENU MOBILE
// ============================================
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const modeMenu = document.getElementById('mobileModeMenu');
  const insertMenu = document.getElementById('mobileInsertMenu');
  if (modeMenu && !modeMenu.classList.contains('hidden')) modeMenu.classList.add('hidden');
  if (insertMenu && !insertMenu.classList.contains('hidden')) insertMenu.classList.add('hidden');
  if (menu) {
    menu.classList.toggle('hidden');
    if (!menu.classList.contains('hidden')) {
      setTimeout(() => {
        document.addEventListener('click', function h(e) {
          if (!e.target.closest('.mobile-menu')) {
            menu.classList.add('hidden');
            document.removeEventListener('click', h);
          }
        });
      }, 100);
    }
  }
}

function closeMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.add('hidden');
}

function toggleMobileModeMenu() {
  const menu = document.getElementById('mobileModeMenu');
  const actionMenu = document.getElementById('mobileMenu');
  const insertMenu = document.getElementById('mobileInsertMenu');
  if (actionMenu && !actionMenu.classList.contains('hidden')) actionMenu.classList.add('hidden');
  if (insertMenu && !insertMenu.classList.contains('hidden')) insertMenu.classList.add('hidden');
  if (menu) {
    menu.classList.toggle('hidden');
    updateMobileModeUI();
    if (!menu.classList.contains('hidden')) {
      setTimeout(() => {
        document.addEventListener('click', function h(e) {
          if (!e.target.closest('.mobile-mode-menu')) {
            menu.classList.add('hidden');
            document.removeEventListener('click', h);
          }
        });
      }, 100);
    }
  }
}

function closeMobileModeMenu() {
  const menu = document.getElementById('mobileModeMenu');
  if (menu) menu.classList.add('hidden');
}

function toggleMobileInsert() {
  if (currentMode !== 'edit') return;
  const menu = document.getElementById('mobileInsertMenu');
  const actionMenu = document.getElementById('mobileMenu');
  const modeMenu = document.getElementById('mobileModeMenu');
  if (actionMenu && !actionMenu.classList.contains('hidden')) actionMenu.classList.add('hidden');
  if (modeMenu && !modeMenu.classList.contains('hidden')) modeMenu.classList.add('hidden');
  if (menu) {
    menu.classList.toggle('hidden');
    if (!menu.classList.contains('hidden')) {
      updateMobileInsertMenu();
      setTimeout(() => {
        document.addEventListener('click', function h(e) {
          if (!e.target.closest('.mobile-insert')) {
            menu.classList.add('hidden');
            document.removeEventListener('click', h);
          }
        });
      }, 100);
    }
  }
}

function closeMobileInsert() {
  const menu = document.getElementById('mobileInsertMenu');
  if (menu) menu.classList.add('hidden');
}

function updateMobileInsertMenu() {
  const s = getS();
  const jammerText = document.getElementById('mobile-jammer-text');
  if (jammerText && s) jammerText.textContent = s.showJammer ? '🔧 Jammer: Sì' : '🔧 Jammer: No';
  const dxText = document.getElementById('mobile-dx-text');
  if (dxText && s) dxText.textContent = s.showDX ? '☑ DX' : '☐ DX';
  const sxText = document.getElementById('mobile-sx-text');
  if (sxText && s) sxText.textContent = s.showSX ? '☑ SX' : '☐ SX';
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

// AVVIO
init();