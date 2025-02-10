const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs/promises');

// Función para verificar si un archivo ya existe
const doesFileExist = async (filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

// Función para scrapear datos de un partido
const scrapeMatchData = async (matchId) => {
  const filePath = `match_${matchId}_head_to_head.json`;

  // Si el archivo ya existe, cargar y devolver los datos
  if (await doesFileExist(filePath)) {
    console.log(`⏭️ Partido ${matchId} ya scrapeado, cargando desde archivo...`);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  }

  try {
    const url = `https://www.premierleague.com/match/${matchId}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Función para extraer los "Total Wins"
    const getTotalWins = (container) => {
      const rows = $(container).find('.statRow');
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const statText = $(row).find('.stat').text().trim();
        if (statText === 'Total Wins') {
          return $(row).find('.count').text().trim() || '0';
        }
      }
      return '0';
    };

    const headToHeadData = {
      team1Name: $('.headToHeadTableLeft .team').text().trim(),
      team1Wins: getTotalWins('.headToHeadTableLeft'),
      team2Name: $('.headToHeadTableRight .team').text().trim(),
      team2Wins: getTotalWins('.headToHeadTableRight'),
      draws: $('.middle-section .draws span').text().trim(),
    };

    // Guardar datos en JSON
    await fs.writeFile(filePath, JSON.stringify(headToHeadData, null, 2));
    console.log(`✅ Datos guardados para el partido ${matchId}`);

    return headToHeadData;

  } catch (error) {
    console.error(`❌ Error al scrapear partido ${matchId}:`, error.message);
    return { error: `Error al scrapear partido ${matchId}` };
  }
};

module.exports = scrapeMatchData;
