let scheda = {
  nome: "Scheda",
  esercizi: []
};

function render() {
  const app = document.getElementById("app");
  app.innerHTML = "";

  scheda.esercizi.forEach((ex, i) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <input value="${ex.nome}" onchange="scheda.esercizi[${i}].nome=this.value">

      <div class="serie">
        ${ex.serie.map(s => `
          <div>
            <input type="number" value="${s.reps}" 
              onchange="s.reps=this.value">
            x
            <input type="number" value="${s.kg}"
              onchange="s.kg=this.value">
          </div>
        `).join("")}
      </div>

      <button onclick="aggiungiSerie(${i})">+ Serie</button>
    `;

    app.appendChild(div);
  });
}

function nuovaScheda() {
  scheda = { nome: "Nuova Scheda", esercizi: [] };
  render();
}

function aggiungiEsercizio() {
  scheda.esercizi.push({
    nome: "Nuovo esercizio",
    serie: [{ reps: 10, kg: 20 }]
  });
  render();
}

function aggiungiSerie(index) {
  scheda.esercizi[index].serie.push({ reps: 10, kg: 20 });
  render();
}

function salvaScheda() {
  localStorage.setItem("scheda", JSON.stringify(scheda));
  alert("Salvata!");
}

function carica() {
  const dati = localStorage.getItem("scheda");
  if (dati) scheda = JSON.parse(dati);
  render();
}

carica();