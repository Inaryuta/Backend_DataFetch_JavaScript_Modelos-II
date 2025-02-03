const puppeteer = require('puppeteer');
const fs = require('fs'); 
const express = require('express'); 

const app = express();
const PORT = 3000;

// Main function to extract data
async function extractClubBadges() {
  // start browser
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to the Premier League club page
  await page.goto('https://www.premierleague.com/clubs', {
    waitUntil: 'networkidle2', // Esperar a que la página cargue completamente
  });

  // Extract club data
  const clubData = await page.evaluate(() => {
    const clubElements = document.querySelectorAll('li.clubList__club');
    const clubData = [];

    // Go through the club elements
    for (let i = 0; i < clubElements.length; i++) {
      const element = clubElements[i];
      const badgeImg = element.querySelector('img.js-badge-image');
      const clubName = element.querySelector('.name');

      // Verify if elements exists
      if (badgeImg && clubName) {
        clubData.push({
          name: clubName.textContent.trim(), // Extract club name
          badgeUrl: badgeImg.src, // Extrct Badge URL
        });
      }
    }

    return clubData;
  });

  // Close browser
  await browser.close();

  return clubData;
}

// Save data in JSON file
function saveClubBadgesToFile(clubData) {
  fs.writeFileSync('club_badge_data.json', JSON.stringify(clubData, null, 2));
  console.log('Club badge URLs and names saved to club_badge_data.json');
}

// HTTP Endpoint to show data
function setupHttpEndpoint(clubData) {
  app.get('/club-badges', (req, res) => {
    res.json(clubData);
  });

  app.listen(PORT, () => {
    console.log(`📡 Servidor corriendo en http://localhost:${PORT}/club-badges`);
  });
}

// Pipeline
(async () => {
  console.log("Iniciando extracción de datos...");

  const clubData = await extractClubBadges();
  console.log(`Extraídos ${clubData.length} clubes.`);

  saveClubBadgesToFile(clubData);

  setupHttpEndpoint(clubData);
})();