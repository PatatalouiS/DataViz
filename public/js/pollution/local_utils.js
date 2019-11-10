
// ---------------------  IMPORTS  --------------------- //

import {getData, dataURL} from '../utils.js';

// ------------------  COMPUTING VALUE  -------------------- //

export const computeCircleColor = dataLine => {
    const {value} = dataLine;
    const ranges  = [50000, 150000, 250000, 500000, 1000000];
    const values  = ['#2ca02c', '#1f77b4', '#ff7f0e', '#d62728', '#8c564b'];

    for(let index in ranges) if(value <= ranges[index]) return values[index];
    return '#581845';
};

export const computeCircleRadius = (dataLine, maxValue) => {
    const {value} = dataLine;
    const linearScale = d3.scaleSqrt()
        .domain([0, maxValue])
        .range([15, 150]);

    return linearScale(value);
}

export const getTotalFromData = (data, field) => {
    return data
        .reduce((total, dataLine) => total + dataLine[field] , 0);
}

// --------------------  FETCH FUNCTIONS --------------------- //

export const getSelectedData = async (continent, year, dataType) => {
    const url = `${dataURL}pollution`;
    const data = continent === 'Top'
        ? await getData(`${url}/top10/${year}`)
        : await getData(`${url}/bycontinent/${continent}/${year}`)
    const maxValue = data.reduce((acc, dataLine) => dataLine.value > acc ? dataLine.value : acc , null);
    return data.map(dataLine => Object.assign({}, dataLine, { radius : computeCircleRadius(dataLine, maxValue)}));
}

// ----------------- DOM-RELATED FUNCTIONS ------------------ //

export const getCheckedRadioButton = radioClass => {
    return Array.from(document.getElementsByClassName(radioClass))
        .map(button => button.checked ? button.getAttribute('id') : false)
        .filter(val => val !== false)[0];
};

// ------------------------ EXPORTS --------------------------- //

export default {
    getCheckedRadioButton,
    computeCircleColor,
    computeCircleRadius,
    getTotalFromData,
    getSelectedData
};

