
'use strict'

const dotenv        = require('dotenv').config();
const {PORT, MODE}  = process.env;
const express       = require('express');
const app           = express();
const cors          = require('cors');
const mysql         = require('./modules/mysql-promise')(process.env);
const sendQueryJSON = require('./modules/utils');

app.set('view engine', 'ejs');
app.use('/static', express.static('public'));
app.use(cors());

// ------- ROUTES DE NAVIGATION -------- //

app.get('/', (req, res) => {
	res.render('index', {});
});

app.get('/home', async (req, res) => {
	res.render('home', {});
});

// ------- ROUTES GETDATA POUR FETCH -------- //

app.get('/data/utils/countriesnames', async (req, res) => {
	const queryResult = await mysql(/*sql*/`SELECT DISTINCT name FROM countries ORDER BY name`);
	sendQueryJSON(queryResult, res);
});

app.get('/data/utils/countriesnames/total/:year', async (req, res) => {
	const queryResult = await mysql(/*sql*/`SELECT DISTINCT name FROM GlobalCountriesPollution WHERE year = ? ORDER BY name`,
	[req.params.year]);
	sendQueryJSON(queryResult, res);
});

app.get('/data/pollution/total', async (req, res) => {
	const queryResult = await mysql(/*sql*/`SELECT * FROM GlobalCountriesPollution ORDER BY name, year`);
	sendQueryJSON(queryResult, res);
});

app.get('/data/pollution/total/bycountry/:country', async (req, res) => {
	const queryResult = await mysql(/*sql*/`SELECT * FROM GlobalCountriesPollution WHERE name = ?`, [req.params.country]);
	sendQueryJSON(queryResult, res);  
});

app.get('/data/pollution/total/bycountry/:country/:year', async (req, res) => {
	const queryResult = await mysql(/*sql*/`SELECT * FROM GlobalCountriesPollution WHERE name = ? AND year = ?`, [req.params.country, req.params.year]);
	sendQueryJSON(queryResult, res);  
});

app.get('/data/pollution/total/bycontinent/:continent', async (req, res) => {
	const queryResult = await mysql(/*sql*/`SELECT name, year, value FROM GlobalCountriesPollution WHERE continent = ?`, [req.params.continent]);
	sendQueryJSON(queryResult, res);
});

app.get('/data/pollution/total/bycontinent/:continent/:year', async (req, res) => {
	const queryResult = await mysql(/*sql*/`SELECT name, year, value FROM GlobalCountriesPollution WHERE continent = ? AND year = ?`, [req.params.continent, req.params.year]);
	sendQueryJSON(queryResult, res);
});

app.get('/data/pollution/total/top10/:year', async (req, res) => {
	const queryResult = await mysql(/*sql*/`SELECT name, year, value FROM GlobalCountriesPollution WHERE year = ? ORDER BY value DESC LIMIT 0,10`, [req.params.year]);
	sendQueryJSON(queryResult, res);
});

app.get('/data/pollution/per-capita/bycountry/:country/:year', async (req, res) => {
	const queryResult = await mysql(/*sql*/`SELECT name, year, valuePerCapita FROM PerCapitaCountriesPollution WHERE name = ? AND year = ?`, [req.params.country, req.params.year]);
	sendQueryJSON(queryResult, res);  
});

app.get('/data/pollution/per-capita/bycontinent/:continent/:year', async (req, res) => {
	const queryResult = await mysql(/*sql*/ `SELECT name, year, valuePerCapita FROM PerCapitaCountriesPollution WHERE continent = ? AND year = ?`,
	[req.params.continent, req.params.year]);
	sendQueryJSON(queryResult, res);
});

app.get('/data/pollution/per-capita/top10/:year', async (req, res) => {
	const queryResult = await mysql(/*sql*/ `SELECT name, year, valuePerCapita FROM PerCapitaCountriesPollution WHERE year = ? ORDER BY valuePerCapita DESC LIMIT 0,10`, [req.params.year]);
	sendQueryJSON(queryResult, res);
});

// ----------  LISTEN ---------- //

app.listen(PORT, () => console.log(`Server is listenning on PORT : ${PORT} Mode is : ${MODE}`));
