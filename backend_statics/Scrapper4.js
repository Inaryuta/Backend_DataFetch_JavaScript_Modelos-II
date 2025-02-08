const axios = require('axios');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = 3000;

// Función para extraer estadísticas del partido usando la API
async function extractStats(matchId) {
  try {
    const url = `https://footballapi.pulselive.com/football/stats/match/${matchId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching match stats:', error);
    return null;
  }
}

// Función para guardar las estadísticas en un archivo JSON
function saveStatsToFile(stats, matchId) {
  const outputFile = `match_${matchId}_stats.json`;
  fs.writeFileSync(outputFile, JSON.stringify(stats, null, 2));
  console.log(`Stats saved to ${outputFile}`);
}

// Configurar el endpoint HTTP para servir las estadísticas
function setupHttpEndpoint(stats, matchId) {
  app.get(`/match-stats/${matchId}`, (req, res) => {
    res.json(stats);
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/match-stats/${matchId}`);
  });
}

// Pipeline principal
(async () => {
  const matchId = 116060; // Match ID (cambiar para ver otro partido)

  console.log(`Iniciando extracción de datos para el partido ${matchId}...`);

  // Extraer los datos del partido
  const stats = await extractStats(matchId);

  if (stats) {
    saveStatsToFile(stats, matchId);
    setupHttpEndpoint(stats, matchId);
  } else {
    console.log("No se pudieron extraer estadísticas.");
  }
})();
