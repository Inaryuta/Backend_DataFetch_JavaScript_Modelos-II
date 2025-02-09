const fs = require('fs');
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const API_URL = 'https://footballapi.pulselive.com/football/fixtures?comps=1&teams=1,2,127,130,131,4,6,7,34,8,26,10,11,12,23,15,20,21,25,38&compSeasons=719&page=0&pageSize=10&statuses=U,L&altIds=true&fast=false';
const OUTPUT_FILE = 'fixtures.json';

// Función para obtener los fixtures desde la API
async function fetchFixtures() {
    try {
        const response = await axios.get(API_URL);
        const fixtures = response.data.content.map(match => ({
            homeTeam: match.teams[0].team.name,
            awayTeam: match.teams[1].team.name,
            matchTime: new Date(match.kickoff.millis).toLocaleString()
        }));
        return fixtures;
    } catch (error) {
        console.error('Error al obtener los fixtures:', error);
        return [];
    }
}

// Función para guardar los fixtures en un archivo JSON
function saveFixturesToFile(fixtures) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(fixtures, null, 2));
    console.log(`Fixtures guardados en ${OUTPUT_FILE}`);
}

// Endpoint para obtener los fixtures
app.get('/fixtures', async (req, res) => {
    const fixtures = await fetchFixtures();
    saveFixturesToFile(fixtures);
    res.json(fixtures);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}/fixtures`);
});
