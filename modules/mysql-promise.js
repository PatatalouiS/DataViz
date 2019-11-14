
'use strict';

const mysql = require('mysql');

// ------------------------- Création et connection SGBD ------------------------- //

const create = settings => {
	const SQLConnection = mysql.createConnection(settings);

	const SQLConnect = () => new Promise (resolve => {
		SQLConnection.connect(err => {
			if(err) throw err;
			resolve;
		});
	});

	const SQLQuery = (query, values) => new Promise (resolve => {
		SQLConnection.query(query, values, (err, res) => {
			if(err) throw err;
			resolve(res);
		});
	});

	return SQLQuery
};

// -------------------------------- Requêtes ------------------------------------ //

module.exports = create;
