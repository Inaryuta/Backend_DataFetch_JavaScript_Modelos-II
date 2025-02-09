const axios = require('axios');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = 3003;

// Función para extraer estadísticas específicas del partido
async function extractStats(matchId) {
  try {
    const url = `https://footballapi.pulselive.com/football/stats/match/${matchId}`;
    const response = await axios.get(url);
    const data = response.data;

    // Extraer datos específicos de cada equipo
    const teamStats = {};
    for (const teamId in data.data) {
      const teamData = data.data[teamId];
      const stats = {};

      // Iterar sobre el array "M" usando un bucle tradicional
      for (let i = 0; i < teamData.M.length; i++) {
        const stat = teamData.M[i];
        switch (stat.name) {
          case 'possession_percentage':
            stats.possession = stat.value;
            break;
          case 'ontarget_scoring_att':
            stats.shotsOnTarget = stat.value;
            break;
          case 'total_scoring_att':
            stats.shots = stat.value;
            break;
          case 'touches':
            stats.touches = stat.value;
            break;
          case 'total_pass':
            stats.passes = stat.value;
            break;
          case 'total_tackle':
            stats.tackles = stat.value;
            break;
          case 'total_clearance':
            stats.clearances = stat.value;
            break;
          case 'won_corners':
            stats.corners = stat.value;
            break;
          case 'total_offside':
            stats.offsides = stat.value;
            break;
          case 'total_yel_card':
            stats.yellowCards = stat.value;
            break;
          case 'fk_foul_won':
            stats.foulsConceded = stat.value;
            break;
        }
      }

      teamStats[teamId] = stats;
    }

    return {
      matchId: matchId,
      teams: teamStats,
    };
  } catch (error) {
    console.error('Error fetching match stats:', error);
    return null;
  }
}

// Función para guardar las estadísticas en un archivo JSON
function saveStatsToFile(stats, matchId) {
  const outputFile = `match_${matchId}_stats.json`;
  fs.writeFileSync(outputFile, JSON.stringify(stats, null, 2));
  console.log(`Stats saved to ${outputFile}`);
}

// Configurar el endpoint HTTP para servir las estadísticas dinámicamente
app.get('/match-stats/:matchId', async (req, res) => {
  const matchId = req.params.matchId; // Obtener matchId de la URL
  console.log(`Fetching stats for match ID: ${matchId}`);

  // Extraer los datos del partido
  const stats = await extractStats(matchId);

  if (stats) {
    saveStatsToFile(stats, matchId);
    res.json(stats); // Devolver los datos como respuesta
  } else {
    res.status(500).json({ error: 'No se pudieron extraer estadísticas.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
