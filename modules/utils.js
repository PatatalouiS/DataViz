
'use strict';

export const sendQueryJSON = (queryResult, res) => {
    res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify(queryResult));
};


