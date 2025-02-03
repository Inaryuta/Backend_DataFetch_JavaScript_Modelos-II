const { setTimeout } = require('node:timers/promises');
const puppeteer = require('puppeteer');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = 3000;
const MATCH_ID = 116065; // Change this value to consult a specific match

function extractStats(page, callback) {
    page.$$eval('.matchCentreStatsContainer tr', rows => {
        return rows.map(row => {
            const text = row.textContent.trim();
            const cells = text.split(/\s+/);
            return {
                statName: cells.slice(1, -1).join(' '),
                statValueHome: cells[0],
                statValueAway: cells[cells.length - 1]
            };
        });
    }).then(data => {
        const stats = {};
        data.forEach(row => {
            stats[row.statName] = {
                homeTeam: row.statValueHome,
                awayTeam: row.statValueAway
            };
        });
        callback(stats);
    });
}

function scrapeMatchData(matchId, callback) {
    puppeteer.launch({ headless: true }).then(browser => {
        browser.newPage().then(page => {
            const url = `https://www.premierleague.com/match/${matchId}`;
            page.goto(url).then(() => {
                page.waitForSelector('#onetrust-reject-all-handler').then(() => {
                    page.click('#onetrust-reject-all-handler').then(() => {
                        setTimeout(3000).then(() => {
                            page.waitForSelector('.tablist').then(() => {
                                page.$('.tablist li[data-tab-index="2"]').then(statsButton => {
                                    if (statsButton) {
                                        statsButton.click().then(() => {
                                            console.log("📊 Clicked on the 'Stats' button.");
                                            page.waitForSelector('.mcStatsTab').then(() => {
                                                extractStats(page, stats => {
                                                    const outputFile = `match_${matchId}_stats.json`;
                                                    fs.writeFileSync(outputFile, JSON.stringify(stats, null, 2));
                                                    console.log(`Stats saved to ${outputFile}`);
                                                    browser.close();
                                                    callback(stats);
                                                });
                                            });
                                        });
                                    } else {
                                        console.log("Couldn't find the 'Stats' button.");
                                        browser.close();
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

// Endpoint para consultar estadísticas de un partido
app.get('/match-stats', (req, res) => {
    scrapeMatchData(MATCH_ID, stats => {
        res.json({ matchId: MATCH_ID, stats });
    });
});

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Server running in http://localhost:${PORT}/match-stats`);
});
