const fs = require('fs');
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3006;

// Endpoint que consume la URL y devuelve el JSON "formateado"
app.get('/standings', async (req, res) => {
  try {
    // URL que vamos a consumir
    const url = 'https://footballapi.pulselive.com/football/standings?compSeasons=719&altIds=true&detail=2&FOOTBALL_COMPETITION=1&live=true';

    // Consumimos la URL con axios
    const response = await axios.get(url);

    // Obtenemos el JSON de la respuesta
    const jsonData = response.data;

    // Filtramos y formateamos los datos según la estructura requerida
    const formattedData = [];

    // Verificamos que "tables" existe y tiene el índice 0
    if (jsonData.tables && jsonData.tables[0] && jsonData.tables[0].entries) {
      // Limitamos a los primeros 20 elementos de entries (0 a 19)
      const entries = jsonData.tables[0].entries.slice(0, 20);

      entries.forEach(entry => {
        // Transformamos la información de "form"
        const transformedForm = entry.form.map(match => {
          let outcome;

          // Verificamos el resultado del partido y lo transformamos
          if (match.outcome === 'D') {
            outcome = 'D'; // Empate
          } else if (match.outcome === 'A') {
            // Victoria visitante (A): Comparamos el equipo visitante
            outcome = match.teams[1].team.name === entry.team.name ? 'W' : 'L';
          } else if (match.outcome === 'H') {
            // Victoria local (H): Comparamos el equipo local
            outcome = match.teams[0].team.name === entry.team.name ? 'W' : 'L';
          }

          // Devolvemos el resultado transformado
          return {
            outcome: outcome
          };
        });

        // Extraemos la información relevante
        const teamData = {
          team: {
            name: entry.team.name
          },
          position: entry.position,
          overall: {
            played: entry.overall.played,
            points: entry.overall.points,
            goalsDifference: entry.overall.goalsDifference
          },
          form: transformedForm // Usamos el form transformado
        };

        // Añadimos el equipo formateado a la lista
        formattedData.push(teamData);
      });
    }

    // Respondemos con los datos formateados
    res.json({ tables: formattedData });
  } catch (error) {
    // Si ocurre un error, lo manejamos
    console.error('Error al consumir la API:', error);
    res.status(500).send('Error al consumir la API');
  }
});

// Arrancamos el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
