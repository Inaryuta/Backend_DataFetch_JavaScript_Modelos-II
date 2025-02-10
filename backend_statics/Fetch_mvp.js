const axios = require('axios');

async function fetchMVP(playerId, matchId) {
    try {
        const API_URL   = `https://footballapi.pulselive.com/football/stats/player/${playerId}?fixtures=${matchId}&sys=opta&altIds=false&compCodeForActivePlayer=EN_PR`;
        const IMAGE_URL = `https://resources.premierleague.com/premierleague/photos/players/250x250/${playerId}.png`

        const response = await axios.get(API_URL);
        const mvpData = response.data;

        if (!mvpData || !mvpData.entity) {
            throw new Error('Datos del MVP no encontrados en la respuesta de la API');
        }

        const extractedData = {
            entity: {
                info: {
                    shirtNum: mvpData.entity.info.shirtNum,
                    positionInfo: mvpData.entity.info.positionInfo,
                    imageUrl: IMAGE_URL
                },
                name: {
                    display: mvpData.entity.name.display
                }
            }
        };

        return extractedData;
    } catch (error) {
        console.error('Error al obtener los datos del MVP:', error.message);
        console.error('Detalles:', error.response ? error.response.data : error);
        return null;
    }
}

module.exports = fetchMVP;
