const { setTimeout } = require('node:timers/promises');
const puppeteer = require('puppeteer');
const fs = require('fs'); 
const express = require('express'); 

const app = express();
const PORT = 3000;

// Función principal para extraer datos de "Head-to-Head"
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

    // Hacer clic en el botón "Stats"
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

    // Hacer clic en el botón "Head-to-Head"
    const headToHeadButtonSelector = '.tablist li[data-tab-index="0"]';
    if (await page.$(headToHeadButtonSelector) !== null) {
      await page.click(headToHeadButtonSelector);
      console.log("Clicked on the 'Head-to-Head' button.");
      await setTimeout(3000); // Esperar a que el contenido se cargue
    } else {
      console.log("Couldn't find the 'Head-to-Head' button.");
      await browser.close();
      return;
    }

    // Extraer los datos de "Head-to-Head"
    const headToHeadData = await page.evaluate(() => {
      // Función para encontrar el valor de "Total Wins"
      const getTotalWins = (container) => {
        const statRows = container.querySelectorAll('.statRow');
        for (let i = 0; i < statRows.length; i++) {
          const row = statRows[i];
          const stat = row.querySelector('.stat');
          if (stat && stat.textContent.trim() === 'Total Wins') {
            const count = row.querySelector('.count');
            return count ? count.textContent.trim() : '0';
          }
        }
        return '0';
      };

      const team1Name = document.querySelector('.headToHeadTableLeft .team').textContent.trim();
      const team1Wins = getTotalWins(document.querySelector('.headToHeadTableLeft'));
      const team2Name = document.querySelector('.headToHeadTableRight .team').textContent.trim();
      const team2Wins = getTotalWins(document.querySelector('.headToHeadTableRight'));
      const draws = document.querySelector('.middle-section .draws span').textContent.trim();

      return {
        team1Name,
        team1Wins,
        team2Name,
        team2Wins,
        draws,
      };
    });

    // Cerrar el navegador
    await browser.close();

    return headToHeadData;
  } catch (error) {
    console.error('Error during scraping:', error);
    return null;
  } finally {
    await browser.close();
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

  app.listen(PORT, () => {
    console.log(`Server running in http://localhost:${PORT}/head-to-head/${matchId}`);
  });
}

// Pipeline principal
(async () => {
  const matchId = 116061; // Match ID (change to check another match)

  console.log(`Iniciando extracción de datos para el partido ${matchId}...`);

  // Extraer los datos de "Head-to-Head"
  const headToHeadData = await scrapeMatchData(matchId);

  if (headToHeadData) {
   
    saveHeadToHeadDataToFile(headToHeadData, matchId);

    setupHttpEndpoint(headToHeadData, matchId);
  } else {
    console.log("No se pudieron extraer datos de 'Head-to-Head'.");
  }
})();