
'use strict'


const getMODE = () => {
    return document.getElementById('MODE')
        .getAttribute('data-row');
}


export const getHOST = () => {
    return document.getElementById('MODE')
        .getAttribute('data-row') === 'development'
            ? 'localhost:8080'
            : 'lifprojet.patatalouis.fr';
}


export const getData = url => {
    return fetch(url)
        .then(response => response.json())
        .then(data => {console.log(`Ressource demandée : ${url}`); return data;})
        .then(data => {if(data.err) throw data; return data})
        .then(data => {if(getMODE() === 'development') console.log(data); return data;})
        .catch(error => console.error(`Error : here the error object for you : `, error));
};

export const dataURL = `http://${getHOST()}/data/`;

export class Timer {

    constructor () {
        this.time = null;
    } 

    set (value) {
        this.time = value;
    }

    clear () {
        this.time = clearTimeout(this.time);
    }
}
