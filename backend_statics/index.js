const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');

(async () => {
  const url = 'https://www.premierleague.com/results';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle2' });

  // Scroll infinito para cargar más partidos
  let previousHeight = 0;
  while (true) {
    let newHeight = await page.evaluate('document.body.scrollHeight');
    if (newHeight === previousHeight) break; // Si no hay más contenido, salir del bucle
    previousHeight = newHeight;
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar a que cargue el contenido
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

  // información adicional desde la API
  const apiUrl = 'https://footballapi.pulselive.com/football/fixtures';
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
            fecha: match.kickoff.label,
            local: match.teams[0].team.name,
            visitante: match.teams[1].team.name,
            estadio: match.ground.name,
            ciudad: match.ground.city,
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

  // Guardar los datos en un archivo JSON
  fs.writeFileSync('matchData.json', JSON.stringify([...matchData, ...allMatches], null, 2));

  console.log('Datos guardados en matchData.json');
  await browser.close();
})();
