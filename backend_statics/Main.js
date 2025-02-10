const express           = require('express');
const fetchBadges       = require('./Fetch_badges');
const fetchFixtures     = require('./Fetch_fixtures');
const extractStats      = require('./Fetch_match_stats');
const fetchMatchResults = require('./Fetch_match_results');
const fetchPremierTable = require('./Fetch_premier_table');
const fetchPollMVP      = require('./Fetch_poll_mvp');
const fetchMVP          = require('./Fetch_mvp');   
const scrapeMatchData   = require('./Fetch_headtohead');

const app = express();
const PORT = 3000;


app.get('/badges', async (req, res) => {
    try 
    {
        console.log(`🔍 Fetching badges...`);
        const data = await fetchBadges();
        res.json(data);
        console.log(`✅ DONE!`);
    } 
    catch (error) 
    {
        res.status(500).send(error.message);
    }
});


app.get('/fixtures', async (req, res) => {
    console.log(`🔍 Fetching fixtures...`);
    try 
    {
        const fixtures = await fetchFixtures();
        res.json(fixtures);
        console.log(`✅ DONE!`);
    } 
    catch (error) 
    {
        res.status(500).send(error.message);
    }
});


app.get('/match-stats/:matchId', async (req, res) => {
    const matchId = req.params.matchId;                         // Extract matchId from the URL
    console.log(`🔍 Fetching stats for match ID: ${matchId}...`);
  
    try 
    {
        const stats = await extractStats(matchId);
        res.json(stats);
        console.log(`✅ DONE!`);
    } 
    catch (error) 
    {
        res.status(500).send(error.message);
    }
});


app.get('/match-results', async (req, res) => {
    try 
    {
        console.log(`🔍 Fetching match results...`);
        const matches = await fetchMatchResults();
        res.json(matches);
        console.log(`✅ DONE!`);
    } 
    catch (error) 
    {
        res.status(500).send(error.message);
    }
});


app.get('/standings', async (req, res) => {
    try 
    {
        console.log(`🔍 Fetching standings...`);
        const tableData = await fetchPremierTable();
        res.json(tableData);
        console.log(`✅ DONE!`);
    } 
    catch (error) 
    {
        res.status(500).send(error.message);
    }
});


app.get('/poll-mvp/:pollId', async (req, res) => {
    try {
        const pollId = req.params.pollId;
        console.log(`🔍 Fetching poll MVP for ID: ${pollId}...`);
        const result = await fetchPollMVP(pollId);
        res.json(result);
        console.log(`✅ DONE!`);
    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.get('/mvp-stats/:playerId/:matchId', async (req, res) => {
    const { playerId, matchId } = req.params;

    try {
        console.log(`🔍 Obtaining MVP data by player ID ${playerId} in the match ID ${matchId}...`);
        const mvpData = await fetchMVP(playerId, matchId);

        if (mvpData) {
            res.json(mvpData);
            console.log(`✅ DONE!`);
        } else {
            res.status(404).json({ error: "MVP not found." });
        }
    } catch (error) {
        res.status(500).json(error.message);
    }
});


//Forma de consulta para URL: http://localhost:3000/scrape?matchIds=116054,116055,116056,116057,116058,116059
// URL: http://localhost:3000/scrape?matchIds=[id1],[id2],[id3],...,[idN]
app.get('/scrape', async (req, res) => {
    const { matchIds } = req.query;
  
    if (!matchIds) {
      return res.status(400).json({ error: 'Debe proporcionar matchIds en la URL' });
    }
  
    const matchIdList = matchIds.split(',').map(id => id.trim()).filter(id => /^\d+$/.test(id));
  
    if (matchIdList.length === 0) {
      return res.status(400).json({ error: 'Formato inválido de matchIds' });
    }
  
    console.log(`🔍 Scrapeando partidos: ${matchIdList.join(', ')}`);
  
    try {
      // Esperar a que todas las promesas se resuelvan antes de responder
      const results = await Promise.all(matchIdList.map(scrapeMatchData));
      res.json(results);
    } catch (error) {
      console.error('❌ Server error:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
  

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});

