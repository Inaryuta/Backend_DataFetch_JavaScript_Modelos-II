const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ruta de la carpeta que contiene los scrapers
const scrapersPath = 'D:\\Inar\\Universidad\\Materias\\Modelos II\\FinalProject\\Backend_DataFetch_JavaScript_Modelos-II\\backend_statics';

// Función para ejecutar un scraper y mostrar su resultado
function runScraper(scraperName) {
  const scraperPath = path.join(scrapersPath, scraperName);

  return new Promise((resolve, reject) => {
    // Colocamos la ruta entre comillas dobles
    exec(`node "${scraperPath}"`, (err, stdout, stderr) => {
      if (err) {
        reject(`Error ejecutando ${scraperName}: ${err.message}`);
      }
      if (stderr) {
        reject(`stderr en ${scraperName}: ${stderr}`);
      }
      resolve(`Resultado de ${scraperName}:\n${stdout}`);
    });
  });
}


// Lista de todos los scrapers a ejecutar
const scrapers = [
  'Scrapper_Badges.js',
  'Scrapper_Fixtures.js',
  'Scrapper_head_to_head.js',
  'Scrapper_match_stats.js',
  'Scrapper_matches_results.js',
  'Scrapper_mvp.js',
  'Scrapper_premier_table.js'
];

// Función principal para ejecutar todos los scrapers al mismo tiempo
async function runAllScrapers() {
  try {
    // Ejecuta todos los scrapers en paralelo
    const results = await Promise.all(scrapers.map(runScraper));
    
    // Muestra los resultados de cada scraper
    results.forEach((result, index) => {
      console.log(result);
    });
  } catch (error) {
    console.error('Hubo un error ejecutando los scrapers:', error);
  }
}

// Llamada a la función para ejecutar todos los scrapers
runAllScrapers();
