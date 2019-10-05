
'use strict'

const dotenv       = require('dotenv').config();
const {PORT, MODE} = process.env;
const express      = require('express');
const app          = express();
const cors = require('cors');
const mysql        = require('./modules/mysql-promise')(process.env);
const APIKEY = 'LIFPROJET_DATASET';

app.set('view engine', 'ejs');
app.use('/static', express.static('public'));
app.use(cors());

// ------- Tests ------- //

app.get('/bt', async (req, res) =>
{
	res.render('bt', {} );
});

app.get('/query', async (req, res) => {
	const query =
	`SELECT idc, year, value FROM Pollution` ;

	const queryResult = await mysql(query);
	res.setHeader('Content-type', 'Application/json');
	res.end(JSON.stringify(queryResult));
});

// ------- INDEX -------- //

app.get('/', (req, res) =>
{
	res.render('index');
});

// ------- HOME/MAIN ------- //

app.get('/home2', async (req, res) =>
{
	const countries = await mysql('SELECT DISTINCT country FROM Pollution ORDER BY country');
	res.render('home2', { countries : countries.map(line => line.country)} );
});

app.get('/home', async (req, res) =>
{
	res.render('home', {});
});

// ------- GETDATA -------- //

app.get('/data/pollution/bycountry/:country/', async (req, res) =>
{
	const queryResult = await mysql(`SELECT * FROM Pollution WHERE country = '${req.params.country}'`);
	
	document.getElementById('svg');

	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(queryResult));
});


app.get('/data/pollution', async (req, res) =>
{
	const queryResult = await mysql('SELECT * FROM Pollution ORDER BY country');
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(queryResult));
})

app.get('/data/pollution/bycontinent/:continent', async (req, res) =>
{
	const queryResult = await mysql(`SELECT name, year, value FROM Pollution NATURAL JOIN Countries WHERE continent = '${req.params.continent}'`);
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(queryResult));
});


// ----------  LISTEN ---------- //

app.listen(PORT, () => console.log(`Server is listenning on PORT : ${PORT} Mode is : ${MODE}`));
