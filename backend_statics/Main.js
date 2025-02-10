const express = require('express');
const fetchBadges = require('./Fetch_badges');
const fetchFixtures = require('./Fetch_fixtures');
const extractStats = require('./Fetch_match_stats');
const fetchMatchResults = require('./Fetch_match_results');
const fetchPremierTable = require('./Fetch_premier_table');
const fetchPollMVP = require('./Fetch_poll_mvp');
const fetchMVP = require('./Fetch_mvp');
const scrapeMatchData = require('./Fetch_headtohead');

const app = express();
const PORT = 3000;


app.get('/badges', (req, res) => {
    console.log(`🔍 Fetching badges...`);
    fetchBadges().then(function(data) {
        res.json(data);
        console.log(`✅ DONE!`);
    }).catch(function(error) {
        res.status(500).send(error.message);
    });
});


app.get('/fixtures', (req, res) => {
    console.log(`🔍 Fetching fixtures...`);
    fetchFixtures().then(function(fixtures) {
        res.json(fixtures);
        console.log(`✅ DONE!`);
    }).catch(function(error) {
        res.status(500).send(error.message);
    });
});


app.get('/match-stats/:matchId', (req, res) => {
    const matchId = req.params.matchId; 
    console.log(`🔍 Fetching stats for match ID: ${matchId}...`);
    extractStats(matchId).then(function(stats) {
        res.json(stats);
        console.log(`✅ DONE!`);
    }).catch(function(error) {
        res.status(500).send(error.message);
    });
});


app.get('/match-results', (req, res) => {
    console.log(`🔍 Fetching match results...`);
    fetchMatchResults().then(function(matches) {
        res.json(matches);
        console.log(`✅ DONE!`);
    }).catch(function(error) {
        res.status(500).send(error.message);
    });
});


app.get('/standings', (req, res) => {
    console.log(`🔍 Fetching standings...`);
    fetchPremierTable().then(function(tableData) {
        res.json(tableData);
        console.log(`✅ DONE!`);
    }).catch(function(error) {
        res.status(500).send(error.message);
    });
});


app.get('/poll-mvp/:pollId', (req, res) => {
    const pollId = req.params.pollId;
    console.log(`🔍 Fetching poll MVP for ID: ${pollId}...`);
    fetchPollMVP(pollId).then(function(result) {
        res.json(result);
        console.log(`✅ DONE!`);
    }).catch(function(error) {
        res.status(500).send(error.message);
    });
});


app.get('/mvp-stats/:playerId/:matchId', (req, res) => {
    const playerId = req.params.playerId;
    const matchId = req.params.matchId;
    console.log(`🔍 Obtaining MVP data by player ID ${playerId} in the match ID ${matchId}...`);
    fetchMVP(playerId, matchId).then(function(mvpData) {
        if (mvpData) {
            res.json(mvpData);
            console.log(`✅ DONE!`);
        } else {
            res.status(404).json({ error: "MVP not found." });
        }
    }).catch(function(error) {
        res.status(500).json(error.message);
    });
});


// Forma de consulta para URL: http://localhost:3000/scrape?matchIds=116054,116055,116056,116057,116058,116059
// URL: http://localhost:3000/scrape?matchIds=[id1],[id2],[id3],...,[idN]
app.get('/scrape', (req, res) => {
    const matchIds = req.query.matchIds;
    if (!matchIds) {
        return res.status(400).json({ error: 'There is no matchIds in the URL' });
    }

    const matchIdList = [];
    const matchIdArray = matchIds.split(',');
    for (let i = 0; i < matchIdArray.length; i++) {
        let id = matchIdArray[i].trim();
        if (/^\d+$/.test(id)) {
            matchIdList.push(id);
        }
    }

    if (matchIdList.length === 0) {
        return res.status(400).json({ error: 'Invalid format for matchIds' });
    }

    console.log(`🔍 Scrapping matchs: ${matchIdList.join(', ')}`);
    const scrapePromises = [];
    for (let i = 0; i < matchIdList.length; i++) {
        scrapePromises.push(scrapeMatchData(matchIdList[i]));
    }

    Promise.all(scrapePromises).then(function(results) {
        res.json(results);
        console.log(`✅ DONE!`);
    }).catch(function(error) {
        console.error('❌ Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    });
});


app.listen(PORT, function() {
    console.log(`Server running at port ${PORT}`);
});
