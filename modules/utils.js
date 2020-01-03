
'use strict';

const sendQueryJSON = (queryResult, res) => {
    res.setHeader('Content-Type', 'application/json');
    
    if(queryResult.length !== 0) res.json(queryResult)
    else {
        res.status(404)
            .json({
                err: 1,
                desc: `Data doesn't exists`
            });
    }
};

module.exports = sendQueryJSON;


