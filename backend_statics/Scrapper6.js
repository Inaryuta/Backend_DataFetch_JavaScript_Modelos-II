const axios = require('axios');

// Función para obtener partidos ya jugados
async function getPlayedMatches() {
  try {
    const url = 'https://footballapi.pulselive.com/football/fixtures?comps=1&compSeasons=719&teams=1,2,127,130,131,4,6,7,34,8,26,10,11,12,23,15,20,21,25,38&page=0&pageSize=20&sort=desc&statuses=A,C&altIds=true&fast=false';
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching played matches:', error);
    return null;
  }
}

// Función para obtener partidos "Head to Head" entre dos equipos
async function getHeadToHead(team1Id, team2Id) {
  const playedMatches = await getPlayedMatches();

  if (!playedMatches) {
    console.log("No se pudieron obtener los partidos ya jugados.");
    return null;
  }

  // Filtrar partidos donde ambos equipos hayan participado
  const headToHeadMatches = playedMatches.content.filter(match => {
    const teamIds = match.teams.map(team => team.team.id);
    return teamIds.includes(team1Id) && teamIds.includes(team2Id);
  });

  return headToHeadMatches;
}

// Función para analizar los resultados de los partidos "Head to Head"
function analyzeHeadToHead(headToHeadMatches, team1Id, team2Id) {
  const results = {
    team1Wins: 0,
    team2Wins: 0,
    draws: 0,
    matches: headToHeadMatches.length,
  };

  headToHeadMatches.forEach(match => {
    const team1 = match.teams.find(team => team.team.id === team1Id);
    const team2 = match.teams.find(team => team.team.id === team2Id);

    if (team1.score > team2.score) {
      results.team1Wins++;
    } else if (team2.score > team1.score) {
      results.team2Wins++;
    } else {
      results.draws++;
    }
  });

  return results;
}

// Ejemplo de uso
(async () => {
  const team1Id = 1; // ID del primer equipo (por ejemplo, Arsenal)
  const team2Id = 2; // ID del segundo equipo (por ejemplo, Aston Villa)

  const headToHeadMatches = await getHeadToHead(team1Id, team2Id);

  if (headToHeadMatches && headToHeadMatches.length > 0) {
    const headToHeadResults = analyzeHeadToHead(headToHeadMatches, team1Id, team2Id);
    console.log(`Resultados Head to Head entre los equipos ${team1Id} y ${team2Id}:`, headToHeadResults);
  } else {
    console.log("No se encontraron partidos Head to Head entre los equipos especificados.");
  }
})();
