const axios = require('axios');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = 3000;

// Función para obtener datos de "Head-to-Head" desde la API
async function fetchHeadToHeadData(matchId) {
  try {
    const url = `https://footballapi.pulselive.com/football/stats/match/${matchId}`;
    const response = await axios.get(url);
    const headToHeadData = response.data;

    if (headToHeadData) {
      console.log(`Datos de 'Head-to-Head' obtenidos para el partido ${matchId}`);
      return headToHeadData;
    } else {
      throw new Error('Datos de "Head-to-Head" no encontrados en la respuesta de la API');
    }
  } catch (error) {
    console.error('Error fetching Head-to-Head data:', error.message);
    console.error('Error details:', error.response ? error.response.data : error);
    return null;
  }
}

// Guardar los datos en un archivo JSON
function saveHeadToHeadDataToFile(headToHeadData, matchId) {
  const outputFile = `match_${matchId}_head_to_head.json`;
  fs.writeFileSync(outputFile, JSON.stringify(headToHeadData, null, 2));
  console.log(`Head-to-Head data saved to ${outputFile}`);
}

// Endpoint HTTP para exponer los datos
function setupHttpEndpoint(headToHeadData, matchId) {
  app.get(`/head-to-head/${matchId}`, (req, res) => {
    res.json(headToHeadData);
  });
  /*
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/head-to-head/${matchId}`);
  });
  */
}

// Pipeline principal
(async () => {
  const matchId = 116061; // Match ID (change to check another match)

  console.log(`Iniciando extracción de datos para el partido ${matchId}...`);

  // Extraer los datos de "Head-to-Head"
  const headToHeadData = await fetchHeadToHeadData(matchId);

  if (headToHeadData) {
    saveHeadToHeadDataToFile(headToHeadData, matchId);
    setupHttpEndpoint(headToHeadData, matchId);
  } else {
    console.log("No se pudieron extraer datos de 'Head-to-Head'.");
  }
})();
