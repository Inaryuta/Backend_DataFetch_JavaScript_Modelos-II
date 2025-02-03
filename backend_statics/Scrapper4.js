const { setTimeout } = require('node:timers/promises');
const puppeteer = require('puppeteer');
const fs = require('fs'); 
const express = require('express'); 

const app = express();
const PORT = 3000;

async function extractStats(page) {
  const stats = {};

  // Extract statistics rows
  const rows = await page.$$eval('.matchCentreStatsContainer tr', (rows) => {
    const result = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const text = row.textContent.trim();
      const match = text.match(/^(\d+(\.\d+)?)\s+(.+?)\s+(\d+(\.\d+)?)$/);

      if (match) {
        result.push({
          statName: match[3], // stats name
          statValueHome: match[1], // local value
          statValueAway: match[4], // away value
        });
      }
    }
    return result;
  });

  // Map data to the `stats` object
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    stats[row.statName] = {
      homeTeam: row.statValueHome,
      awayTeam: row.statValueAway,
    };
  }

  return stats;
}

// Main function to extract data from a match
async function scrapeMatchData(matchId) {
  // Start browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Build the URL with the match ID
  const url = `https://www.premierleague.com/match/${matchId}`;
  await page.goto(url);
  await page.waitForSelector('#onetrust-reject-all-handler');
  await page.click('#onetrust-reject-all-handler');
  await setTimeout(3000);

  // Wait for the page to load and make sure the button is present
  await page.waitForSelector('.tablist');

  // Search and click in "Stats" button
  const statsButton = await page.$('.tablist li[data-tab-index="2"]');
  if (statsButton) {
    await statsButton.click();
    console.log("Clicked on the 'Stats' button.");
  } else {
    console.log("Couldn't find the 'Stats' button.");
    await browser.close();
    return;
  }

  await page.waitForSelector('.mcStatsTab');
  const stats = await extractStats(page);
  await browser.close();
  return stats;
}

function saveStatsToFile(stats, matchId) {
  const outputFile = `match_${matchId}_stats.json`;
  fs.writeFileSync(outputFile, JSON.stringify(stats, null, 2));
  console.log(`Stats saved to ${outputFile}`);
}

function setupHttpEndpoint(stats, matchId) {
  app.get(`/match-stats/${matchId}`, (req, res) => {
    res.json(stats);
  });

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}/match-stats/${matchId}`);
  });
}

// Pipeline 
(async () => {
  const matchId = 116059; // Match ID (change to check another match)

  console.log(`Iniciando extracción de datos para el partido ${matchId}...`);

  const stats = await scrapeMatchData(matchId);

  if (stats) {
    saveStatsToFile(stats, matchId);
    setupHttpEndpoint(stats, matchId);
  } else {
    console.log("No se pudieron extraer estadísticas.");
  }
})();