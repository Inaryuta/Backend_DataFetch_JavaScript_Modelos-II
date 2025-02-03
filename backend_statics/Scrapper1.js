const puppeteer = require('puppeteer');
const fs = require('fs'); 
const express = require('express');

const app = express();
const PORT = 3000;

// Main function to extract Data
async function extractFixtures() {
  // start browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the Premier League match page
  await page.goto('https://www.premierleague.com/fixtures', {
    waitUntil: 'networkidle2',
  });

  // Extract match data
  const fixtures = await page.evaluate(() => {
    const fixtureElements = document.querySelectorAll('li.match-fixture');
    const fixtures = [];

    // Go through the elements of the matches
    for (let i = 0; i < fixtureElements.length; i++) {
      if (fixtures.length >= 15) break; // Stop after 15 matches

      const element = fixtureElements[i];
      const homeTeam = element.getAttribute('data-home');
      const awayTeam = element.getAttribute('data-away');
      const matchTime = new Date(Number(element.getAttribute('data-comp-match-item-ko'))).toLocaleString();

      // Add match to Array
      fixtures.push({
        homeTeam,
        awayTeam,
        matchTime,
      });
    }

    return fixtures;
  });

  // Close browser
  await browser.close();

  return fixtures;
}

// Save data in JSON file
function saveFixturesToFile(fixtures) {
  fs.writeFileSync('fixtures.json', JSON.stringify(fixtures, null, 2));
  console.log('Fixtures saved to fixtures.json');
}

// HTTP Endpoint to show data
function setupHttpEndpoint(fixtures) {
  app.get('/fixtures', (req, res) => {
    res.json(fixtures);
  });

  app.listen(PORT, () => {
    console.log(`📡 Servidor corriendo en http://localhost:${PORT}/fixtures`);
  });
}

// Pipeline
(async () => {
  console.log("Iniciando extracción de datos...");

  // Extract Data
  const fixtures = await extractFixtures();
  console.log(`Extraídos ${fixtures.length} partidos.`);

  // Save data in JSON file
  saveFixturesToFile(fixtures);

  // Set up HTTP Endpoint
  setupHttpEndpoint(fixtures);
})();