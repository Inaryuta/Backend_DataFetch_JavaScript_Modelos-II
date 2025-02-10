const fs = require('fs');
const axios = require('axios');

const API_URL = 'https://footballapi.pulselive.com/football/standings?compSeasons=719&altIds=true&detail=2&FOOTBALL_COMPETITION=1&live=true';

// Función para obtener la tabla de posiciones
async function fetchPremierTable() {
    try {
        const response = await axios.get(API_URL);
        const jsonData = response.data;
        const formattedData = [];

        if (jsonData.tables && jsonData.tables[0] && jsonData.tables[0].entries) {
            const entries = jsonData.tables[0].entries.slice(0, 20);

            // bucle for tradicional
            for (let i = 0; i < entries.length; i++) {
                const entry = entries[i];
                const transformedForm = [];

                for (let j = 0; j < entry.form.length; j++) {
                    const match = entry.form[j];
                    let outcome;

                    if (match.outcome === 'D') {
                        outcome = 'D'; // Empate
                    } else if (match.outcome === 'A') {
                        outcome = match.teams[1].team.name === entry.team.name ? 'W' : 'L';
                    } else if (match.outcome === 'H') {
                        outcome = match.teams[0].team.name === entry.team.name ? 'W' : 'L';
                    }

                    transformedForm.push({ outcome });
                }

                const teamData = {
                    team: { name: entry.team.name },
                    position: entry.position,
                    overall: {
                        played: entry.overall.played,
                        points: entry.overall.points,
                        goalsDifference: entry.overall.goalsDifference
                    },
                    form: transformedForm
                };

                formattedData.push(teamData);
            }
        }

        return formattedData; // Cambio aquí para devolver directamente el arreglo
    } catch (error) {
        console.error("Error al obtener la tabla de posiciones:", error.message);
        throw new Error("No se pudo obtener la tabla de posiciones.");
    }
}

module.exports = fetchPremierTable;
