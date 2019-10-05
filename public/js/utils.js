
'use strict'


const getHOST = () => {
    return document.getElementById('MODE')
        .getAttribute('data-row') === 'development'
            ? 'localhost:8080'
            : 'lifprojet.patatalouis.fr';
}


export const getData = (url) => {
    return fetch(url)
        .then(response => response.json())
        .then(response => {console.log(`Ressource demandée : ${url}`); return response;})
        .catch(console.error);
};


export const dataURL = `http://${getHOST()}/data/`;

