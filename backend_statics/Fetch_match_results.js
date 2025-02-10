const axios = require('axios');

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
        throw new Error("No se pudieron obtener los resultados de los partidos.");
    }
}

module.exports = fetchMatchResults;
