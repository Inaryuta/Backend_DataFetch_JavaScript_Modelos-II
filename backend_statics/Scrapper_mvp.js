const axios = require('axios');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = 3000;

// Función para extraer datos del MVP usando la API
async function scrapeMVP(matchId) {
  try {
    const url = `https://footballapi.pulselive.com/football/stats/player/p219847?fixtures=${matchId}&sys=opta&altIds=false&compCodeForActivePlayer=EN_PR`;
    const response = await axios.get(url);
    const mvpData = response.data;

    if (mvpData && mvpData.entity) {
      console.log(`MVP del partido ${matchId}: ${mvpData.entity.name.display} (${mvpData.entity.info.position})`);
      console.log(`Imagen del MVP: ${mvpData.entity.imageUrl}`);
      console.log('Estadísticas:', mvpData.stats);

      fs.writeFileSync('mvp_data.json', JSON.stringify(mvpData, null, 2), 'utf8');
      console.log('Datos guardados en mvp_data.json');

      return mvpData;
    } else {
      throw new Error('Datos del MVP no encontrados en la respuesta de la API');
    }
  } catch (error) {
    console.error('Error fetching MVP data:', error.message);
    console.error('Error details:', error.response ? error.response.data : error);
    return null;
  }
}

// Configurar el endpoint HTTP para servir los datos del MVP
function setupHttpEndpoint(mvpData, matchId) {
  app.get(`/mvp-stats/${matchId}`, (req, res) => {
    res.json(mvpData);
  });

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}/mvp-stats/${matchId}`);
  });
}

// Pipeline principal
(async () => {
  const matchId = 116057; // Match ID (cambiar para ver otro partido)

  console.log(`Iniciando extracción de datos para el partido ${matchId}...`);

  // Extraer los datos del MVP
  const mvpData = await scrapeMVP(matchId);

  if (mvpData) {
    setupHttpEndpoint(mvpData, matchId);
  } else {
    console.log("No se pudieron extraer datos del MVP.");
  }
})();
