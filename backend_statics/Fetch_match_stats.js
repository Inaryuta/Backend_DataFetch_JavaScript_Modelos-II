const axios = require('axios');
const fs = require('fs');

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
    throw new Error('Error al obtener estadísticas del partido');
  }
}

module.exports = extractStats;
