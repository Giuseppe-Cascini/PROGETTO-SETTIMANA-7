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

class Evento {
    constructor(dati) {
        this.id = dati.idEvent;
        this.data = dati.dateEvent;
        this.squadraCasa = dati.strHomeTeam;
        this.squadraOspite = dati.strAwayTeam;
        this.golCasa = dati.intHomeScore;
        this.golOspite = dati.intAwayScore;

    }
}



// === API ===

async function cercaSquadra(nome) {
    spinnerRicerca.classList.remove('d-none');

    try {
        const url = `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${nome}`
        const risposta = await fetch(url);
        if (!risposta.ok) {
            throw new Error(`Errore HTTP: ${risposta.status}`);
        }


        const dati = await risposta.json();

        const squadre = (dati.teams ?? []).map(team => new Squadra(team));
        console.log(squadre);
        renderSquadre(squadre)
    } catch (errore) {
        console.log(errore);
        /*listaRisultati.textContent = '';
        const alert = document.createAttribute('div');
        alert.className = 'alert alert-danger'
        alert.textContent = 'Errore durante il caricamento delle squadre';
        listaRisultati.appendChild(alert);*/
    } finally {
        spinnerRicerca.classList.add('d-none');
    }
}

async function dettagli(teamId, nomeSquadra) {
    const urlEventiprossimi = `https://www.thesportsdb.com/api/v1/json/123/eventsnext.php?id=${teamId}`
    const urlEventipassati = `https://www.thesportsdb.com/api/v1/json/123/eventslast.php?id=${teamId}`

    const risposte = await Promise.all([
        fetch(urlEventiprossimi),
        fetch(urlEventipassati)
    ]);
    const dati = await Promise.all([
        risposte[0].json(),
        risposte[1].json()
    ]);

    const eventiProssimi = dati[0].events ?? [];
    const eventiPassati = dati[1].results ?? [];
    console.log(eventiProssimi);
    console.log(eventiPassati);
    const prossimePartite = eventiProssimi.map(e => new Evento(e));
    const ultimePartite = eventiPassati.map(e => new Evento(e));
    renderDettagli(nomeSquadra, prossimePartite, ultimePartite);


}
// === Stato ===
let preferiti = JSON.parse(localStorage.getItem('preferiti'));

if (!preferiti) {
    preferiti = [];
}
function salvaPreferiti() {
    localStorage.setItem('preferiti', JSON.stringify(preferiti));
}

// === Render ===
const listaRisultati = document.querySelector('#listaRisultati');
const spinnerRicerca = document.querySelector('#spinnerRicerca');
const dettagliSection = document.querySelector('#dettagli-section');
const preferitiSection = document.querySelector('#preferiti-section');

function renderSquadre(squadre) {
    listaRisultati.textContent = '';
    if (squadre.length === 0) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-danger'
        alert.textContent = 'Nessuna squadra trovata'

        listaRisultati.appendChild(alert);
        return;
    }

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

        btnAggiungiPreferiti.addEventListener('click', (e) => {
            e.stopPropagation();

            if (!preferiti.some(p => p.id === squadra.id)) {
                preferiti.push(squadra);
                salvaPreferiti();
                renderPreferiti();
            }
        });

        cardBody.append(img, nomeSquadra, lega, paese, btnAggiungiPreferiti);
        card.appendChild(cardBody);
        article.appendChild(card);
        listaRisultati.appendChild(article);

        card.addEventListener('click', () => {
            dettagli(squadra.id, squadra.nome);
        });





    })

}
function renderPreferiti() {
    const titolo = preferitiSection.querySelector('h2');

    preferitiSection.textContent = '';
    preferitiSection.appendChild(titolo);

    const row = document.createElement('div');
    row.className = 'row g-3';

    preferiti.forEach(squadra => {
        const article = document.createElement('article');
        article.className = 'col-12 col-md-6 col-lg-4';

        const card = document.createElement('div');
        card.className = 'card h-100';

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body text-center';

        const img = document.createElement('img');
        img.src = squadra.logo;
        img.alt = `Logo ${squadra.nome}`;
        img.className = 'img-fluid p-2';

        const nomeSquadra = document.createElement('h5');
        nomeSquadra.className = 'card-title fw-bold';
        nomeSquadra.textContent = squadra.nome;

        const lega = document.createElement('p');
        lega.textContent = squadra.lega;

        const paese = document.createElement('p');
        paese.textContent = squadra.paese;
        const btnRimuovi = document.createElement('button');
        btnRimuovi.className = 'btn btn-danger w-100';
        btnRimuovi.textContent = 'Rimuovi';

        btnRimuovi.addEventListener('click', (e) => {
            e.stopPropagation();

            preferiti = preferiti.filter(p => p.id !== squadra.id);

            salvaPreferiti();
            renderPreferiti();
        });

        cardBody.append(img, nomeSquadra, lega, paese, btnRimuovi);
        card.appendChild(cardBody);
        article.appendChild(card);
        row.appendChild(article);
        card.addEventListener('click', () => {
            dettagli(squadra.id, squadra.nome);
        });
    });

    preferitiSection.appendChild(row);
}
function renderDettagli(nomeSquadra, prossimePartite, ultimePartite) {
    dettagliSection.hidden = false;
    dettagliSection.textContent = '';
    const card = document.createElement('div');
    card.className = 'card p-4 mt-4 shadow-sm';
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';
    const titoloSquadra = document.createElement('h4');
    titoloSquadra.textContent = nomeSquadra;
    titoloSquadra.className = 'fw-bold mb-4';

    cardBody.appendChild(titoloSquadra);


    const titoloProssimiEventi = document.createElement('h4');
    titoloProssimiEventi.textContent = 'Prossimi eventi';
    titoloProssimiEventi.className = 'mt-4 mb-3'
    cardBody.appendChild(titoloProssimiEventi);
    const linea1 = document.createElement('hr');
    cardBody.appendChild(linea1);

    if (prossimePartite.length === 0) {
        const messaggio = document.createElement('p');
        messaggio.textContent = 'Nessun evento in programma';
        cardBody.appendChild(messaggio);
    } else {
        prossimePartite.forEach(partita => {
            const prossimaPartita = document.createElement('p');
            prossimaPartita.textContent = `${partita.squadraCasa} vs ${partita.squadraOspite}`;
            const dataPartita = document.createElement('p');
            dataPartita.textContent = partita.data;
            dataPartita.className = 'text-muted mb-1';

            cardBody.appendChild(dataPartita);
            cardBody.appendChild(prossimaPartita);
        });
    }
    const titoloUltimiRisultati = document.createElement('h4');
    titoloUltimiRisultati.textContent = 'Ultimi risultati';
    titoloUltimiRisultati.className = 'mt-4 mb-3'
    cardBody.appendChild(titoloUltimiRisultati);
    const linea2 = document.createElement('hr');
    cardBody.appendChild(linea2);

    if (ultimePartite.length === 0) {
        const messaggio = document.createElement('p');
        messaggio.textContent = 'Nessun risultato disponibile';

        cardBody.appendChild(messaggio);
    } else {
        ultimePartite.forEach(partita => {
            const risultato = document.createElement('p');

            risultato.textContent = `${partita.squadraCasa} vs ${partita.squadraOspite}`;

            const punteggio = document.createElement('span');
            punteggio.className = 'badge bg-success ms-2';
            punteggio.textContent = `${partita.golCasa ?? '-'} - ${partita.golOspite ?? '-'}`;

            risultato.appendChild(punteggio);
            const dataRisultato = document.createElement('p');
            dataRisultato.textContent = partita.data;
            dataRisultato.className = 'text-muted mb-1';

            cardBody.appendChild(dataRisultato);
            cardBody.appendChild(risultato);
        });
    }
    card.appendChild(cardBody);
    dettagliSection.appendChild(card);
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
renderPreferiti();