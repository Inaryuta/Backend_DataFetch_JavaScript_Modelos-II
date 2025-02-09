const express = require('express');
const scrapperBadges = require('./backend_statics/Scrapper_Badges');
const scrapperFixtures = require('./backend_statics/Scrapper_Fixtures');
const scrapperHeadToHead = require('./backend_statics/Scrapper_Head_to_Head');
const scrapperMatchStats = require('./backend_statics/Scrapper_Match_Stats');
const scrapperMatchesResults = require('./backend_statics/Scrapper_Matches_Results');
const scrapperMVP = require('./backend_statics/Scrapper_MVP');
const scrapperPremierTable = require('./backend_statics/Scrapper_Premier_Table');

const app = express();
const PORT = 3000;

app.get('/badges', async (req, res) => {
    try {
        const data = await scrapperBadges.extractData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo los badges' });
    }
});

app.get('/fixtures', async (req, res) => {
    try {
        const data = await scrapperFixtures.extractData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo los fixtures' });
    }
});

app.get('/head_to_head', async (req, res) => {
    try {
        const data = await scrapperHeadToHead.extractData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo los datos de head-to-head' });
    }
});

app.get('/match_stats', async (req, res) => {
    try {
        const data = await scrapperMatchStats.extractData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo las estadísticas de los partidos' });
    }
});

app.get('/matches_results', async (req, res) => {
    try {
        const data = await scrapperMatchesResults.extractData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo los resultados de los partidos' });
    }
});

app.get('/mvp', async (req, res) => {
    try {
        const data = await scrapperMVP.extractData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo los MVP' });
    }
});

app.get('/premier_table', async (req, res) => {
    try {
        const data = await scrapperPremierTable.extractData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo la tabla de la Premier League' });
    }
});

// Iniciar el servidor en el puerto 3000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Endpoints disponibles:`);
    console.log(`- http://localhost:${PORT}/badges`);
    console.log(`- http://localhost:${PORT}/fixtures`);
    console.log(`- http://localhost:${PORT}/head_to_head`);
    console.log(`- http://localhost:${PORT}/match_stats`);
    console.log(`- http://localhost:${PORT}/matches_results`);
    console.log(`- http://localhost:${PORT}/mvp`);
    console.log(`- http://localhost:${PORT}/premier_table`);
});
