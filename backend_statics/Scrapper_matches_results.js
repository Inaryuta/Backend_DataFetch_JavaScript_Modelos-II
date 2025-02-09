const fs = require('fs');
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const API_URL = 'https://footballapi.pulselive.com/football/fixtures?comps=1&compSeasons=719&teams=1,2,127,130,131,4,6,7,34,8,26,10,11,12,23,15,20,21,25,38&page=0&pageSize=20&sort=desc&statuses=A,C&altIds=true&fast=false';

// Función para obtener los resultados desde la API
async function fetchMatchResults() {
    try {
        const response = await axios.get(API_URL);
        const fixtures = response.data.content;
        const matches = [];

        // Extraer solo la información necesaria
        for (let i = 0; i < Math.min(fixtures.length, 10); i++) {
            const fixture = fixtures[i];

            const match = {
                date: new Date(fixture.kickoff.millis).toDateString(),
                homeTeam: fixture.teams[0].team.name,
                awayTeam: fixture.teams[1].team.name,
                score: `${fixture.teams[0].score} - ${fixture.teams[1].score}`,
                matchId: fixture.id.toString(),
                mvpId: fixture.altIds.opta,
            };

            matches.push(match);
        }

        return matches;
    } catch (error) {
        console.error("Error al obtener los datos:", error.message);
        return [];
    }
}

// Función para guardar los resultados en un archivo JSON
function saveMatchResultsToFile(matches) {
    fs.writeFileSync('premier_league_results.json', JSON.stringify(matches, null, 2));
    console.log('Resultados guardados en premier_league_results.json');
}

// Función para configurar el endpoint HTTP
function setupHttpEndpoint(matches) {
    app.get('/match-results', (req, res) => {
        res.json(matches);
    });
    
    /*
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}/match-results`);
    });
    */
}

// Pipeline
(async () => {
    console.log("Iniciando extracción de datos...");

    const matches = await fetchMatchResults();
    console.log(`Extraídos ${matches.length} partidos.`);

    saveMatchResultsToFile(matches);

    setupHttpEndpoint(matches);
})();
