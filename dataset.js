
'use strict'

const dotenv       = require('dotenv').config();
const {PORT, MODE} = process.env;
const express      = require('express');
const app          = express();
const cors         = require('cors');
const mysql        = require('./modules/mysql-promise')(process.env);
const nanoid       = require('nanoid');
import {sendQueryJSON} from './modules/utils.js';


app.set('view engine', 'ejs');
app.use('/static', express.static('public'));
app.use(cors());


// ------- Tests ------- //


// Page test pour BT
app.get('/bt', async (req, res) => {
	res.render('bt', {} );
});

// Page test pour Max
app.get('/max', async (req, res) => {
	console.log(nanoid());
	const countries = await mysql('SELECT DISTINCT name FROM Countries ORDER BY name');
	res.render('max', { countries : countries.map(line => line.name)} );
});

//Exécuter des requêtes
app.get('/query', async (req, res) => {
	const query =
	`SELECT idc, year, value FROM Pollution` ;

	const queryResult = await mysql(query);

	res.setHeader('Content-type', 'Application/json');
	res.end(JSON.stringify(queryResult));
});

// ------- ROUTES DE NAVIGATION -------- //

app.get('/', (req, res) => {
	res.render('index', {});
});

app.get('/home', async (req, res) => {
	res.render('home', {});
});

// ------- ROUTES GETDATA POUR FETCH -------- //

app.get('/data/pollution', async (req, res) => {
	const queryResult = await mysql('SELECT * FROM countriespollution ORDER BY name, year');
	sendQueryJSON(queryResult, res);
})

app.get('/data/pollution/bycountry/:country/', async (req, res) => {
	const queryResult = await mysql('SELECT * FROM countriespollution WHERE name = ?', [req.params.country]);
	sendQueryJSON(queryResult, res);
});

app.get('/data/pollution/bycontinent/:continent', async (req, res) => {
	const queryResult = await mysql('SELECT name, year, value FROM countriespollution WHERE continent = ?', [req.params.continent]);
	sendQueryJSON(queryResult, res);
});

app.get('/data/pollution/bycontinent/:continent/:year', async (req, res) => {
	const queryResult = await mysql('SELECT name, year, value FROM countriespollution WHERE continent = ? AND year = ?', [req.params.continent, req.params.year]);
	sendQueryJSON(queryResult, res);
});

app.get('/data/pollution/top10/:year', async (req, res) => {
	const queryResult = await mysql('SELECT name, year, value FROM countriespollution WHERE year = ? ORDER BY value DESC LIMIT 0,10', [req.params.year]);
	sendQueryJSON(queryResult, res);
});


// ----------  LISTEN ---------- //

app.listen(PORT, () => console.log(`Server is listenning on PORT : ${PORT} Mode is : ${MODE}`));

