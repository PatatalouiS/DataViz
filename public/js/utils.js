
'use strict';

// ------------------------ SET/GET ENVIRONEMENT ----------------------------------- //

export const getHOST = () => {
    return document.getElementById('MODE')
        .getAttribute('data-row') === 'development'
            ? 'localhost:8080'
            : 'patatalouis.fr';
}

// ----------------------- FETCH GET QUERY --> JSON ------------------------------- //

export const getData = url => {
    console.log(`Ressource demandée : ${url}`);
    return fetch(url)
        .then(response => response.json())
        .then(data => {if(data.err) throw data; return data})
        .catch(error => console.error(`Error : here the error object for you : `, error));
};

export const URL = `http://${getHOST()}`;

export const dataURL = `${URL}/data/pollution`;

export const countriesURL = `${URL}/data/utils/countriesnames`;

// ----------------------- UTILS FUNCTIONS --------------------------------------- //

export const interpolationTabNumber = (number, start, end, round = false) => {
    const range = (end-start);
    const step = range/(number-1);
    const mappers = [(x,i) => start + x * step, (x,i) => Math.round(start + x*step)];

    const values = new Array(number-2)
        .fill(0)
        .map((x, i) => i+1)
        .map(mappers[Number(round)])
        
    return [start].concat(values).concat([end]);
};

// ------------------------ EXPORTS ---------------------------------------------- //

export default {
    getHOST,
    getData,
    dataURL,
    interpolationTabNumber,
};
