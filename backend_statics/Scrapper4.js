const { setTimeout } = require('node:timers/promises');
const puppeteer = require('puppeteer');
const fs = require('fs'); // Para guardar el JSON
const express = require('express'); // Para el endpoint HTTP

const app = express();
const PORT = 3000;

// Función para extraer estadísticas
async function extractStats(page) {
  const stats = {};

  // Extraer filas de estadísticas
  const rows = await page.$$eval('.matchCentreStatsContainer tr', (rows) => {
    const result = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const text = row.textContent.trim();

      // Expresión regular para extraer datos
      const match = text.match(/^(\d+(\.\d+)?)\s+(.+?)\s+(\d+(\.\d+)?)$/);

      if (match) {
        result.push({
          statName: match[3], // Nombre de la estadística
          statValueHome: match[1], // Valor local
          statValueAway: match[4], // Valor visitante
        });
      }
    }
    return result;
  });

  // Mapear datos al objeto `stats`
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    stats[row.statName] = {
      homeTeam: row.statValueHome,
      awayTeam: row.statValueAway,
    };
  }

  return stats;
}

// Función principal para extraer datos de un partido
async function scrapeMatchData(matchId) {
  // Iniciar el navegador
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navegar a la URL del partido
    const url = `https://www.premierleague.com/match/${matchId}`;
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Manejar el pop-up de cookies
    const cookieSelector = '#onetrust-reject-all-handler';
    if (await page.$(cookieSelector) !== null) {
      await page.click(cookieSelector);
      await setTimeout(3000); // Esperar a que la página reaccione
    }

    // Esperar y hacer clic en el botón "Stats"
    const statsButtonSelector = '.tablist li[data-tab-index="2"]';
    if (await page.$(statsButtonSelector) !== null) {
      await page.click(statsButtonSelector);
      console.log("Clicked on the 'Stats' button.");
      await setTimeout(3000); // Esperar a que las estadísticas se carguen
    } else {
      console.log("Couldn't find the 'Stats' button.");
      await browser.close();
      return;
    }

    // Esperar a que las estadísticas estén visibles
    await page.waitForSelector('.mcStatsTab');

    // Extraer las estadísticas
    const stats = await extractStats(page);

    // Cerrar el navegador
    await browser.close();

    return stats;
  } catch (error) {
    console.error('Error during scraping:', error);
    return null;
  } finally {
    await browser.close();
  }
}

// Guardar los datos en un archivo JSON
function saveStatsToFile(stats, matchId) {
  const outputFile = `match_${matchId}_stats.json`;
  fs.writeFileSync(outputFile, JSON.stringify(stats, null, 2));
  console.log(`Stats saved to ${outputFile}`);
}

// Endpoint HTTP para exponer los datos
function setupHttpEndpoint(stats, matchId) {
  app.get(`/match-stats/${matchId}`, (req, res) => {
    res.json(stats);
  });

  app.listen(PORT, () => {
    console.log(`Server running in http://localhost:${PORT}/match-stats/${matchId}`);
  });
}

// Pipeline principal
(async () => {
  const matchId = 116061; // ID del partido de ejemplo

  console.log(`Iniciando extracción de datos para el partido ${matchId}...`);

  // Extraer los datos
  const stats = await scrapeMatchData(matchId);

  if (stats) {
    // Guardar los datos en un archivo JSON
    saveStatsToFile(stats, matchId);

    // Configurar el endpoint HTTP
    setupHttpEndpoint(stats, matchId);
  } else {
    console.log("No se pudieron extraer estadísticas.");
  }
})();