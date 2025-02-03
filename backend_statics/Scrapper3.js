const puppeteer = require('puppeteer');
const fs = require('fs'); 
const express = require('express'); 

const app = express();
const PORT = 3000;

// Main function to extract data
async function extractMatchResults() {
  // Start browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the Premier League results page
  await page.goto('https://www.premierleague.com/results', {
    waitUntil: 'networkidle2', // Esperar a que la página cargue completamente
  });

  // Extract match Data
  const matches = await page.evaluate(() => {
    const matchElements = document.querySelectorAll('li.match-fixture');
    const date = document.querySelector('.fixtures__date') ? document.querySelector('.fixtures__date').textContent.trim() : 'N/A';
    const matchData = [];

    // Go through the first 15 games
    for (let i = 0; i < Math.min(matchElements.length, 15); i++) {
      const matchElement = matchElements[i];
      const homeTeam = matchElement.getAttribute('data-home');
      const awayTeam = matchElement.getAttribute('data-away');
      const score = matchElement.querySelector('.match-fixture__score') ? matchElement.querySelector('.match-fixture__score').textContent.trim() : 'N/A';
      const matchId = matchElement.getAttribute('data-comp-match-item');

      matchData.push({
        date,
        homeTeam,
        awayTeam,
        score,
        matchId,
      });
    }

    return matchData;
  });

  // Close browser
  await browser.close();

  return matches;
}

// Save Data in a JSON file
function saveMatchResultsToFile(matches) {
  fs.writeFileSync('premier_league_matches_with_dates.json', JSON.stringify(matches, null, 2));
  console.log('First 15 match results with dates saved to premier_league_matches_with_dates.json');
}

// HTTP Endpoint to show Data
function setupHttpEndpoint(matches) {
  app.get('/match-results', (req, res) => {
    res.json(matches);
  });

  app.listen(PORT, () => {
    console.log(`📡 Servidor corriendo en http://localhost:${PORT}/match-results`);
  });
}

// Pipeline 
(async () => {
  console.log("Iniciando extracción de datos...");

  const matches = await extractMatchResults();
  console.log(`Extraídos ${matches.length} partidos.`);

  saveMatchResultsToFile(matches);

  setupHttpEndpoint(matches);
})();