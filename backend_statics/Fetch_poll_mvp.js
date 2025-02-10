const axios = require('axios');

async function fetchPollMVP(pollId) {
    const url = `https://footballapi.pulselive.com/voting/premierleague/results/${pollId}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (!data.pollResult || !data.pollResult.results || data.pollResult.results.length === 0) {
            return { error: "No hay resultados disponibles." };
        }

        // Retornar solo el contenido de results, sin pollResult ni results
        return {
            0: {
                id: data.pollResult.results[0].id
            }
        };
    } catch (error) {
        return { error: "Error al obtener los datos.", details: error.message };
    }
}

module.exports = fetchPollMVP;
