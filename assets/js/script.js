// SportsHub — Week Project Settimana VII
//
// Devi fare 4 cose per la Versione Base:
// 1. Definire le classi Squadra ed Evento (mappano i dati di TheSportsDB)
// 2. Funzione async cercaSquadre(query) che chiama /searchteams.php
// 3. Funzione async caricaDettagli(idTeam) che chiama in parallelo
//    eventsnext.php + eventslast.php usando Promise.all
// 4. Render dinamico: card squadre, lista prossimi eventi, lista risultati
//
// Endpoint base: https://www.thesportsdb.com/api/v1/json/3/
// Il `3` nell'URL è la chiave API pubblica di test di TheSportsDB: gratis, non serve registrarsi.
//
// Per le versioni Intermedia/Avanzata: localStorage preferiti, debounce, Promise.all multi.


// === Classi ===
class Squadra {
    constructor(dati) {
        this.id = dati.idTeam;
        this.nome = dati.strTeam;
        this.logo = dati.strBadge;
        this.lega = dati.strLeague ?? "-";
        this.paese = dati.strCountry ?? "-";
        this.sport = dati.strSport;
    }
}



// === API ===

async function cercaSquadra(nome) {
    console.log(nome);
    const url = `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${nome}`
    const risposta = await fetch(url);
    if (!risposta.ok) {
        throw new Error(`Errore HTTP: ${risposta.status}`);
    }
    const dati = await risposta.json();
    console.log(dati);
    const squadre = (dati.teams ?? []).map(team => new Squadra(team));
    console.log(squadre);
    renderSquadre(squadre)
}

// === Stato ===



// === Render ===
const listaRisultati = document.querySelector('#listaRisultati');

function renderSquadre(squadre) {
    listaRisultati.textContent = '';
    squadre.forEach(squadra => {
        const article = document.createElement('article');
        article.className = 'col-12 col-md-6 col-lg-4'
        const card = document.createElement('div');
        card.className = 'card h-100'
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body text-center'
        const img = document.createElement('img');
        img.src = squadra.logo;
        img.alt = `Logo ${squadra.nome}`;
        img.className = 'img-fluid p-2';
        const nomeSquadra = document.createElement('h5');
        nomeSquadra.className = 'card-title fw-bold';
        nomeSquadra.textContent = squadra.nome
        const lega = document.createElement('p');
        lega.className = 'card-text mb-0';
        lega.textContent = squadra.lega;
        const paese = document.createElement('p');
        paese.className = 'card-text';
        paese.textContent = squadra.paese;
        const btnAggiungiPreferiti = document.createElement('button');
        btnAggiungiPreferiti.className = 'btn btn-warning w-100';
        btnAggiungiPreferiti.textContent = '⭐️ Aggiungi ai preferiti';

        cardBody.append(img, nomeSquadra, lega, paese, btnAggiungiPreferiti);
        card.appendChild(cardBody);
        article.appendChild(card);
        listaRisultati.appendChild(article);


        


    })


}



// === Eventi ===
const ricercaForm = document.querySelector('#ricercaForm');
const inputRicerca = document.querySelector('#inputRicerca');

ricercaForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const ricerca = inputRicerca.value.trim();
    if (!ricerca) {
        return;
    }
    cercaSquadra(ricerca);
});