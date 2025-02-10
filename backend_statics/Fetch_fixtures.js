const axios = require('axios');

const API_URL = 'https://footballapi.pulselive.com/football/fixtures?comps=1&teams=1,2,127,130,131,4,6,7,34,8,26,10,11,12,23,15,20,21,25,38&compSeasons=719&page=0&pageSize=10&statuses=U,L&altIds=true&fast=false';

// Función para obtener los fixtures desde la API
async function fetchFixtures() {
    try {
        const response = await axios.get(API_URL);
        const fixturesData = response.data.content;
        const fixtures = [];

        // Reemplazando map con un ciclo for tradicional
        for (let i = 0; i < fixturesData.length; i++) {
            const match = fixturesData[i];
            const fixture = {
                homeTeam: match.teams[0].team.name,
                awayTeam: match.teams[1].team.name,
                matchTime: new Date(match.kickoff.millis).toLocaleString()
            };
            fixtures.push(fixture);
        }
        
        return fixtures;
    } catch (error) {
        console.error('Error al obtener los fixtures:', error);
        throw new Error('Error al obtener los datos de la API');
    }
}

module.exports = fetchFixtures;
