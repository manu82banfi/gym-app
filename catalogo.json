// ============================================
// CATALOGO ESERCIZI - DATI DI DEFAULT
// Questi sono gli esercizi "di partenza". L'utente può modificarli
// dall'app: le modifiche vengono salvate in localStorage + cloud.
// Se un utente vuole "tornare al default", basta cancellare la cache.
// ============================================

// Gruppi muscolari - MODIFICA QUI per aggiungerne di nuovi
// (devono corrispondere ai colori dei marker in style.css)
const MUSCOLI = ['Petto', 'Bicipiti', 'Tricipiti', 'Addominali', 'Gambe', 'Dorso', 'Spalle'];

// Colori per badge muscolo - devono corrispondere a --marker-* in style.css
const MUSCOLI_COLORI = {
  'Petto':      '#2582e6',
  'Bicipiti':   '#4CAF50',
  'Tricipiti':  '#f44336',
  'Addominali': '#fa8405',
  'Gambe':      '#8f0663',
  'Dorso':      '#cccccc',
  'Spalle':     '#FFEB3B'
};

// ============================================
// ESERCIZI DI DEFAULT (~55)
// Aggiungi/modifica qui gli esercizi che vuoi pre-caricare.
// Il campo "foto" può essere:
//   - vuoto (verrà mostrato un placeholder)
//   - "img/esercizi/panca-piana.jpg" (percorso file locale)
//   - un data URL base64 (caricato dall'utente dall'app)
// ============================================
const CATALOGO_DEFAULT = [
  // ---------- PETTO ----------
  { id: 'panca-piana',           nome: 'Panca piana',              muscolo: 'Petto', foto: '', note: 'Bilanciere, presa media' },
  { id: 'panca-inclinata',       nome: 'Panca inclinata',          muscolo: 'Petto', foto: '', note: '' },
  { id: 'panca-declinata',       nome: 'Panca declinata',          muscolo: 'Petto', foto: '', note: '' },
  { id: 'panca-manubri',         nome: 'Panca con manubri',        muscolo: 'Petto', foto: '', note: '' },
  { id: 'croci-cavi',            nome: 'Croci ai cavi',            muscolo: 'Petto', foto: '', note: '' },
  { id: 'croci-manubri',         nome: 'Croci con manubri',        muscolo: 'Petto', foto: '', note: '' },
  { id: 'pectoral-machine',      nome: 'Pectoral machine',         muscolo: 'Petto', foto: '', note: '' },
  { id: 'push-up',               nome: 'Push-up',                  muscolo: 'Petto', foto: '', note: 'A corpo libero' },
  { id: 'dip-petto',             nome: 'Dip per petto',            muscolo: 'Petto', foto: '', note: 'Parallele' },

  // ---------- DORSO ----------
  { id: 'trazioni',              nome: 'Trazioni',                 muscolo: 'Dorso', foto: '', note: 'Sbarra, presa prona' },
  { id: 'lat-machine',           nome: 'Lat machine',              muscolo: 'Dorso', foto: '', note: '' },
  { id: 'rematore-bilanciere',   nome: 'Rematore bilanciere',      muscolo: 'Dorso', foto: '', note: '' },
  { id: 'rematore-manubrio',     nome: 'Rematore manubrio',        muscolo: 'Dorso', foto: '', note: 'Monolaterale' },
  { id: 'pulley-basso',          nome: 'Pulley basso',             muscolo: 'Dorso', foto: '', note: '' },
  { id: 'pulldown-braccia-tesa', nome: 'Pulldown braccia tese',    muscolo: 'Dorso', foto: '', note: '' },
  { id: 'hyperextension',        nome: 'Hyperextension',           muscolo: 'Dorso', foto: '', note: 'Lombari' },
  { id: 't-bar-row',             nome: 'T-bar row',                muscolo: 'Dorso', foto: '', note: '' },
  { id: 'seated-row',            nome: 'Seated row machine',       muscolo: 'Dorso', foto: '', note: '' },
  { id: 'stacco-da-terra',       nome: 'Stacco da terra',          muscolo: 'Dorso', foto: '', note: 'Full body' },

  // ---------- GAMBE ----------
  { id: 'squat',                 nome: 'Squat',                    muscolo: 'Gambe', foto: '', note: 'Bilanciere' },
  { id: 'squat-frontale',        nome: 'Squat frontale',           muscolo: 'Gambe', foto: '', note: '' },
  { id: 'leg-press',             nome: 'Leg press',                muscolo: 'Gambe', foto: '', note: '' },
  { id: 'affondi',               nome: 'Affondi',                  muscolo: 'Gambe', foto: '', note: '' },
  { id: 'affondi-camminati',     nome: 'Affondi camminati',        muscolo: 'Gambe', foto: '', note: '' },
  { id: 'leg-extension',         nome: 'Leg extension',            muscolo: 'Gambe', foto: '', note: 'Quadricipiti' },
  { id: 'leg-curl',              nome: 'Leg curl',                 muscolo: 'Gambe', foto: '', note: 'Femorali' },
  { id: 'stacco-rumeno',         nome: 'Stacco rumeno',            muscolo: 'Gambe', foto: '', note: 'Femorali' },
  { id: 'calf-raise',            nome: 'Calf raise',               muscolo: 'Gambe', foto: '', note: 'Polpacci' },
  { id: 'hip-thrust',            nome: 'Hip thrust',               muscolo: 'Gambe', foto: '', note: 'Glutei' },
  { id: 'bulgarian-split-squat', nome: 'Bulgarian split squat',    muscolo: 'Gambe', foto: '', note: '' },

  // ---------- SPALLE ----------
  { id: 'military-press',        nome: 'Military press',           muscolo: 'Spalle', foto: '', note: 'Bilanciere' },
  { id: 'lento-avanti-manubri',  nome: 'Lento avanti manubri',     muscolo: 'Spalle', foto: '', note: '' },
  { id: 'alzate-laterali',       nome: 'Alzate laterali',          muscolo: 'Spalle', foto: '', note: 'Deltoide laterale' },
  { id: 'alzate-frontali',       nome: 'Alzate frontali',          muscolo: 'Spalle', foto: '', note: 'Deltoide anteriore' },
  { id: 'alzate-posteriori',     nome: 'Alzate posteriori',        muscolo: 'Spalle', foto: '', note: 'Deltoide posteriore' },
  { id: 'reverse-fly',           nome: 'Reverse fly',              muscolo: 'Spalle', foto: '', note: '' },
  { id: 'shoulder-press-machine',nome: 'Shoulder press machine',   muscolo: 'Spalle', foto: '', note: '' },
  { id: 'face-pull',             nome: 'Face pull',                muscolo: 'Spalle', foto: '', note: '' },
  { id: 'tirate-al-mento',       nome: 'Tirate al mento',          muscolo: 'Spalle', foto: '', note: '' },

  // ---------- BICIPITI ----------
  { id: 'curl-bilanciere',       nome: 'Curl bilanciere',          muscolo: 'Bicipiti', foto: '', note: '' },
  { id: 'curl-manubri',          nome: 'Curl manubri',             muscolo: 'Bicipiti', foto: '', note: '' },
  { id: 'curl-martello',         nome: 'Curl martello',            muscolo: 'Bicipiti', foto: '', note: 'Bracciale' },
  { id: 'curl-concentrato',      nome: 'Curl concentrato',         muscolo: 'Bicipiti', foto: '', note: '' },
  { id: 'curl-cavi',             nome: 'Curl ai cavi',             muscolo: 'Bicipiti', foto: '', note: '' },
  { id: 'curl-scott',            nome: 'Curl Scott',               muscolo: 'Bicipiti', foto: '', note: 'Panca Scott' },

  // ---------- TRICIPITI ----------
  { id: 'french-press',          nome: 'French press',             muscolo: 'Tricipiti', foto: '', note: '' },
  { id: 'pushdown-cavi',         nome: 'Pushdown ai cavi',         muscolo: 'Tricipiti', foto: '', note: '' },
  { id: 'dip-tricipiti',         nome: 'Dip per tricipiti',        muscolo: 'Tricipiti', foto: '', note: '' },
  { id: 'kickback',              nome: 'Kickback',                 muscolo: 'Tricipiti', foto: '', note: '' },
  { id: 'estensioni-sopra-testa',nome: 'Estensioni sopra la testa',muscolo: 'Tricipiti', foto: '', note: '' },

  // ---------- ADDOMINALI ----------
  { id: 'crunch',                nome: 'Crunch',                   muscolo: 'Addominali', foto: '', note: '' },
  { id: 'plank',                 nome: 'Plank',                    muscolo: 'Addominali', foto: '', note: 'Isometrico' },
  { id: 'russian-twist',         nome: 'Russian twist',            muscolo: 'Addominali', foto: '', note: '' },
  { id: 'leg-raise',             nome: 'Leg raise',                muscolo: 'Addominali', foto: '', note: 'Sollevamento gambe' },
  { id: 'ab-wheel',              nome: 'Ab wheel',                 muscolo: 'Addominali', foto: '', note: '' },
  { id: 'mountain-climber',      nome: 'Mountain climber',         muscolo: 'Addominali', foto: '', note: '' }
];