const axios = require('axios');

const API_URL = 'https://api-cdn.ecal.com/apiv3/widget/button/widgetID/calendars?apiKey=6ea0955297341b6b22f516a42177979d55821c6d7217b&path=Fixture%2F%7B%7BECAL_USER_COUNTRYCODE%7D%7D%2F%7B%7BECAL_USER_LANGUAGECODE%7D%7D%2FPremier%20League%2CPL2%20-%20Division%201%2CPL2%20-%20Division%202%2CU18%20Premier%20League%20-%20North%2CU18%20Premier%20League%20-%20South';

async function fetchBadges() {
  try {
    const response = await axios.get(API_URL);
    const jsonData = response.data;

    const filteredCalendars = {};
    const calendarIds = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

    // Reemplazando el forEach con un ciclo for tradicional
    for (let i = 0; i < calendarIds.length; i++) {
      const id = calendarIds[i];
      if (jsonData.calendars && jsonData.calendars[id]) {
        filteredCalendars[id] = {
          name: jsonData.calendars[id].name,
          logo: jsonData.calendars[id].logo
        };
      }
    }

    return { calendars: filteredCalendars };
  } catch (error) {
    console.error('Error al consumir la API:', error);
    throw new Error('Error al obtener los datos de la API');
  }
}

module.exports = fetchBadges;
