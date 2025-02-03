const { setTimeout } = require('node:timers/promises');
const puppeteer = require('puppeteer');
const fs = require('fs'); // Para guardar el JSON
const express = require('express'); // Para el endpoint HTTP

const app = express();
const PORT = 3000;

// Función principal para extraer datos de la tabla
async function extractTableData() {
  // Iniciar el navegador
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navegar a la página de la tabla de la Premier League
    await page.goto('https://www.premierleague.com/tables', {
      waitUntil: 'networkidle2',
    });

    // Rechazar todas las cookies
    await page.waitForSelector('#onetrust-reject-all-handler');
    await page.click('#onetrust-reject-all-handler');
    await setTimeout(3000);

    // Esperar a que el botón LIVE esté presente y visible en la página
    await page.waitForSelector('.js-live-toggle');

    // Hacer clic en el botón LIVE directamente
    await page.evaluate(() => {
      const button = document.querySelector('.toggle-btn__toggle.js-live-toggle');
      if (button) button.click();
    });

    // Esperar a que la tabla se actualice después de hacer clic
    await setTimeout(3000);

    // Esperar a que los elementos de la tabla estén disponibles
    await page.waitForSelector('tbody.league-table__tbody.isPL tr');

    // Extraer datos de la tabla
    const data = await page.evaluate(() => {
      const rows = document.querySelectorAll('tbody.league-table__tbody.isPL tr');
      const result = [];

      // Recorrer las filas de la tabla
      for (let i = 0; i < rows.length; i += 2) {
        if (i >= 40) break; // Asegurarse de no exceder 40 filas

        const row = rows[i];
        const position = row.getAttribute('data-position');
        const club = row.getAttribute('data-filtered-table-row-name');
        const played = row.querySelectorAll('td')[2].innerText; // Jugados
        const points = row.querySelector('.league-table__points').innerText; // Puntos
        const gf = row.querySelectorAll('td')[6].innerText; // Diferencia de Goles

        // Obtener los elementos de la forma
        const formElements = row.querySelectorAll('td')[10].querySelector('ul').querySelectorAll('li');
        const form = [];
        for (let j = 0; j < formElements.length; j++) {
          form.push(formElements[j].querySelector('.form-abbreviation').innerText);
        }

        result.push({
          position,
          club,
          played,
          points,
          gf,
          form: form.join(', '), // Combina los resultados en una cadena
        });
      }

      return result;
    });

    // Cerrar el navegador
    await browser.close();

    return data;
  } catch (error) {
    console.error('Error durante el scraping:', error);
    return null;
  } finally {
    await browser.close();
  }
}

// Guardar los datos en un archivo JSON
function saveTableDataToFile(data) {
  fs.writeFileSync('premier_league_data.json', JSON.stringify(data, null, 2), 'utf-8');
  console.log('Datos guardados en premier_league_data.json');
}

// Endpoint HTTP para exponer los datos
function setupHttpEndpoint(data) {
  app.get('/table-data', (req, res) => {
    res.json(data);
  });

  app.listen(PORT, () => {
    console.log(`Server running in http://localhost:${PORT}/table-data`);
  });
}

// Pipeline principal
(async () => {
  console.log("Iniciando extracción de datos de la tabla...");

  // Extraer los datos
  const tableData = await extractTableData();

  if (tableData) {
    // Guardar los datos en un archivo JSON
    saveTableDataToFile(tableData);

    // Configurar el endpoint HTTP
    setupHttpEndpoint(tableData);
  } else {
    console.log("No se pudieron extraer datos de la tabla.");
  }
})();