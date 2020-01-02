
'use strict'

// ----------------------  SET/GET ENVIRONEMENT -------------------- //

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

// ----------------------  FETCH GET QUERY --> JSON ------------------------- //

export const getData = url => {
    console.log(`Ressource demandée : ${url}`);
    return fetch(url)
        .then(response => response.json())
        .then(data => {if(data.err) throw data; return data})
        .then(data => {if(getMODE() === 'development') return data;})
        .catch(error => console.error(`Error : here the error object for you : `, error));
};

export const dataURL = `http://${getHOST()}/data/pollution`;

// ------------------ CLASS TIMER FOR DELAY HANDLERS --------------- //

export class Timer {

    constructor () {
        this.time = null;
    }

    setTimeout (callback, delay) {
        this.time = setTimeout(callback, delay);
    }

    clearTimeout () {
        this.time = clearTimeout(this.time)
        this.time = null;
    }

    setInterval (callback, delay) {
        this.time = setInterval(callback, delay);
    }

    clearInterval () {
        this.time = clearInterval(this.time);
        this.time = null;
    }

    getTime () {
        return this.time
    }
}

// --------------------- UTILS FUNCTIONS ---------------------- //

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

// ------------------------ EXPORTS -------------------------- //

export default {
    getHOST,
    getData,
    dataURL,
    interpolationTabNumber,
    Timer
};
