const puppeteer = require('puppeteer');
const axios = require('axios');
const fs = require('fs');
const express = require('express');

const url = 'https://www.premierleague.com/results';
const apiUrl = 'https://footballapi.pulselive.com/football/fixtures';

// Función para normalizar nombres de equipos
function normalizeName(name) {
  return name ? name.toLowerCase().trim().replace(/\s+/g, ' ') : '';
}

// Extrae datos de la web con Puppeteer
async function extractData() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });

  // Scroll infinito
  let previousHeight = 0;
  while (true) {
    let newHeight = await page.evaluate('document.body.scrollHeight');
    if (newHeight === previousHeight) break;
    previousHeight = newHeight;
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Extraer datos de los partidos
  const matchData = await page.evaluate(() => {
    const partidos = [];
    const fechas = document.querySelectorAll('.fixtures__date-container');

    fechas.forEach((fecha) => {
      const jornada = fecha.querySelector('.fixtures__date')?.getAttribute('datetime')?.trim();
      const partidos_jornada = fecha.querySelectorAll('.matchList li');

      partidos_jornada.forEach((partido) => {
        const marcador = partido.querySelector('.match-fixture__score')?.textContent.trim();
        const data_partido = {
          local: partido.getAttribute('data-home'),
          visitante: partido.getAttribute('data-away'),
          marcador: marcador || 'No disponible',
          fecha: jornada || 'Fecha no disponible'
        };
        partidos.push(data_partido);
      });
    });

    return partidos;
  });

  await browser.close();
  return matchData;
}

// Extraer datos adicionales de la API
async function extractAdditionalData() {
  let pageNum = 0;
  let allMatches = [];
  let hasMoreData = true;

  while (hasMoreData) {
    try {
      const response = await axios.get(`${apiUrl}?comps=1&compSeasons=719&page=${pageNum}&pageSize=20&sort=desc&statuses=A,C&altIds=true&fast=false`, {
        headers: {
          'Origin': 'https://www.premierleague.com',
          'Referer': 'https://www.premierleague.com/',
          'User-Agent': 'Mozilla/5.0'
        }
      });

      if (response.data && response.data.content.length > 0) {
        response.data.content.forEach(match => {
          allMatches.push({
            id: match.id,
            local: normalizeName(match.teams[0].team.name),
            visitante: normalizeName(match.teams[1].team.name),
            estadio: match.ground.name,
            ciudad: match.ground.city
          });
        });
        pageNum++;
      } else {
        hasMoreData = false;
      }
    } catch (error) {
      console.error('Error al obtener datos de la API:', error);
      hasMoreData = false;
    }
  }

  return allMatches;
}

// Une y ordena los datos
function sortData(matchData, apiData) {
  return matchData.map(match => {
    const normalizedLocal = normalizeName(match.local);
    const normalizedVisitante = normalizeName(match.visitante);

    // Buscar coincidencias exactas entre la web y la api
    let additionalInfo = apiData.find(apiMatch =>
      apiMatch.local === normalizedLocal && apiMatch.visitante === normalizedVisitante
    );

    // Si no hay coincidencia exacta, buscar una coincidencia flexible
    if (!additionalInfo) {
      additionalInfo = apiData.find(apiMatch =>
        normalizedLocal.includes(apiMatch.local) || apiMatch.local.includes(normalizedLocal) ||
        normalizedVisitante.includes(apiMatch.visitante) || apiMatch.visitante.includes(normalizedVisitante)
      );
    }

    return {
      id: additionalInfo?.id || 'No disponible',
      local: match.local,
      visitante: match.visitante,
      marcador: match.marcador,
      fecha: match.fecha,
      estadio: additionalInfo?.estadio || 'No disponible',
      ciudad: additionalInfo?.ciudad || 'No disponible'
    };
  });
}

// Exposicion de datos en un endpoint HTTP
function sendData(data) {
  const app = express();
  const PORT = 3000;

  app.get('/matches', (req, res) => {
    res.json(data);
  });

  app.listen(PORT, () => {
    console.log(`📡 Servidor corriendo en http://localhost:${PORT}/matches`);
  });
}

// Pipeline principal
(async () => {
  console.log("Iniciando extracción de datos...");
  
  const matchData = await extractData();
  console.log(`Extraídos ${matchData.length} partidos desde la web.`);

  const apiData = await extractAdditionalData();
  console.log(`Extraídos ${apiData.length} partidos desde la API.`);

  const sortedData = sortData(matchData, apiData);
  console.log(`Combinados ${sortedData.length} partidos.`);

  // Guardar los datos en un archivo JSON (opcional)
  fs.writeFileSync('matchData.json', JSON.stringify(sortedData, null, 2));
  console.log('Datos guardados en matchData.json');

  sendData(sortedData);
})();
