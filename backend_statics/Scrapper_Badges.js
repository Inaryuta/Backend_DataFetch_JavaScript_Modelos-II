const fs = require('fs');
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// Endpoint que consume la URL y devuelve el JSON "formateado"
app.get('/calendars', async (req, res) => {
  try {
    // URL completa con los parámetros incluidos
    const url = 'https://api-cdn.ecal.com/apiv3/widget/button/widgetID/calendars?apiKey=6ea0955297341b6b22f516a42177979d55821c6d7217b&path=Fixture%2F%7B%7BECAL_USER_COUNTRYCODE%7D%7D%2F%7B%7BECAL_USER_LANGUAGECODE%7D%7D%2FPremier%20League%2CPL2%20-%20Division%201%2CPL2%20-%20Division%202%2CU18%20Premier%20League%20-%20North%2CU18%20Premier%20League%20-%20South';

    // Consumimos la URL de la API externa
    const response = await axios.get(url);

    // Aquí tienes el JSON de la respuesta de la API
    const jsonData = response.data;

    // Filtramos los calendarios que nos interesan (del 1 al 21)
    const filteredCalendars = {};
    const calendarIds = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

    calendarIds.forEach(id => {
      if (jsonData.calendars && jsonData.calendars[id]) {
        // Extraemos solo el name y logo del calendario
        filteredCalendars[id] = {
          name: jsonData.calendars[id].name,
          logo: jsonData.calendars[id].logo
        };
      }
    });

    // Respondemos con el JSON filtrado y formateado
    res.json({ calendars: filteredCalendars });
  } catch (error) {
    // Si ocurre algún error, lo manejamos y respondemos un mensaje de error
    console.error('Error al consumir la API:', error);
    res.status(500).send('Error al consumir la API');
  }
});

/* Arrancamos el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
*/