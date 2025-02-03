const puppeteer = require('puppeteer');
const { setTimeout } = require('node:timers/promises');
const fs = require('fs'); 
const express = require('express'); 

const app = express();
const PORT = 3000;

// Función principal para extraer datos del MVP
async function scrapeMVP(matchId) {
  const url = `https://www.premierleague.com/match/${matchId}`;

  // Iniciar el navegador
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    
    await page.goto(url, { waitUntil: 'networkidle2' });

    const cookieSelector = '#onetrust-reject-all-handler';
    if (await page.$(cookieSelector) !== null) {
      await page.click(cookieSelector);
      await setTimeout(3000);
    }

    // Click en "View More" si es necesario
    const viewMoreSelector = '.kotm-live-commentary__btn';
    if (await page.$(viewMoreSelector) !== null) {
      await page.click(viewMoreSelector);
      await setTimeout(3000);
    }

    // Extraer el nombre y la posición del MVP
    const playerDetailsSelector = '.kotm-results__player-details';
    const playerDetails = await page.evaluate((selector) => {
      const detailsElement = document.querySelector(selector);
      if (!detailsElement) {
        return { fullName: 'No MVP encontrado', position: 'Desconocido' };
      }

      const nameElements = detailsElement.querySelectorAll('h2');
      let fullName = '';
      for (let i = 0; i < nameElements.length; i++) {
        fullName += nameElements[i].innerText.trim() + ' ';
      }
      fullName = fullName.trim();

      const positionElement = detailsElement.querySelector('h4');
      const position = positionElement ? positionElement.innerText.trim() : 'Desconocido';

      return { fullName, position };
    }, playerDetailsSelector);

    // Extraer estadísticas del MVP
    const statsSelector = '.kotm-results__fixture-stats-row';
    const stats = await page.evaluate((selector) => {
      const statsElements = document.querySelectorAll(selector);
      const statsData = {};

      for (let i = 0; i < statsElements.length; i++) {
        const item = statsElements[i];
        const label = item.querySelector('.kotm-results__fixture-stats-value')?.innerText?.trim();
        const value = item.querySelector('.kotm-results__fixture-stats-value--bold')?.innerText?.trim();
        if (label && value) {
          statsData[label] = value;
        }
      }

      return statsData;
    }, statsSelector);

    // Extraer la URL de la imagen del MVP
    const imageSelector = '.kotm-player__player-image.js-winner-image';
    const mvpImage = await page.evaluate((selector) => {
      const imgElement = document.querySelector(selector);
      return imgElement ? imgElement.src : 'No image found';
    }, imageSelector);

    // Crear objeto con los datos del MVP
    const mvpData = {
      matchId: matchId,
      player: {
        name: playerDetails.fullName,
        position: playerDetails.position,
        imageUrl: mvpImage,
      },
      statistics: stats || {},
    };

    console.log(`MVP del partido ${matchId}: ${playerDetails.fullName} (${playerDetails.position})`);
    console.log(`Imagen del MVP: ${mvpImage}`);
    console.log('Estadísticas:', stats);

    fs.writeFileSync('mvp_data.json', JSON.stringify(mvpData, null, 2), 'utf8');
    console.log('Datos guardados en mvp_data.json');

    return mvpData;
  } catch (error) {
    console.error('Error durante el scraping:', error);
    return null;
  } finally {
    await browser.close();
  }
}

function setupHttpEndpoint(mvpData, matchId) {
  app.get(`/mvp-stats/${matchId}`, (req, res) => {
    res.json(mvpData);
  });

  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}/mvp-stats/${matchId}`);
  });
}

// Pipeline 
(async () => {
  const matchId = 116059; // Match ID (change to check another match)

  console.log(`Iniciando extracción de datos para el partido ${matchId}...`);

  // Extraer los datos del MVP
  const mvpData = await scrapeMVP(matchId);

  if (mvpData) {
    setupHttpEndpoint(mvpData, matchId);
  } else {
    console.log("No se pudieron extraer datos del MVP.");
  }
})();