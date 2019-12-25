
// ---------------------  IMPORTS AND CONSTANTS  --------------------- //

import {getData, dataURL, interpolationTabNumber} from '../utils.js';

// Define here your valueKey to bind from data Server
const mainValueKeyNames = {
    'total'     : 'value',
    'per-capita': 'valuePerCapita'
};

const dates = ['1975', '1985', '1995', '2005', '2010', '2012', '2013', '2014'];

// ------------------  COMPUTING VALUE, GET PROJECT CONSTANTS  -------------------- //

export const getMainValue = dataType => {
    try {
        if(!valuesName.hasOwnProperty(dataType)) throw new Error();
        return valuesName[dataType];
    }
    catch (err) {
        console.err(`There is no MainValue field for dataType '${dataType}'`);
    }
}

export const computeCircleColor = (dataLine/*, maxValue*/) => {
    const {value} = dataLine;
    const type = getCheckedRadioButton('radio-t')
    const colorScale = d3.scaleQuantize()
        .domain([0,type == 'total' ? 1000000 : 25])
        .range(['#2ca02c','#cbdc01', '#1f77b4','#ff7f0e', '#d62728', '#8c564b','#581845']);
    return colorScale(value);
};

export const computeCircleRadius = (dataLine, maxValue) => {
    const {value} = dataLine;
    if(getCheckedRadioButton('radio-rp') == 'graph'){
        return 50;
    }
    else {
        const linearScale = d3.scaleSqrt()
            .domain([0, maxValue])
            .range([20, 150]);
        return linearScale(value);
    }    
}

export const getTotalFromData = (data, field) => {
    return data
        .reduce((total, dataLine) => total + dataLine[field] , 0);
}

export const getMaxfromData = (data, field) => {
    return data
        .reduce((max, dataLine) => dataLine[field] > max ? dataLine[field] : max, 0);
}

export const getAllDates = () => dates;

export const valueToDiscreteTimeline = (value, maxValue) => {
    const valueToDiscrete = d3.scaleQuantize()
        .domain([0, maxValue])
        .range(interpolationTabNumber(getAllDates().length, 0, maxValue));
    return valueToDiscrete(value);
};

export const valueToDateTimeline = (value, maxValue) => {
    const valueToDate = d3.scaleQuantize()
        .domain([0, maxValue])
        .range(getAllDates())
    return valueToDate(value);
}

// --------------------  FETCH FUNCTIONS --------------------- //

export const getSelectedData = async (continent, year, dataType) => {
    const url = `${dataURL}pollution`;

    const data = continent === 'Top'
        ? await getData(`${url}/${dataType}/top10/${year}`)
        : await getData(`${url}/${dataType}/bycontinent/${continent}/${year}`);
    const countriesNames = await getData(`${dataURL}utils/countriesnames`);

    const valueKeyName = mainValueKeyNames[dataType];
    const maxValue = getMaxfromData(data, valueKeyName);
    
    return countriesNames.map(country => {
        const dataLine = data.find(dataLine => dataLine.name == country.name);
        if(dataLine) {
            const value = dataLine[valueKeyName];
            const finalRadius = computeCircleRadius({value}, maxValue);
            delete dataLine[valueKeyName];
            return Object.assign(dataLine, { value, finalRadius, currentRadius : 0 });  
        } 
        else return {name : country.name, value : 0, currentRadius : 0, finalRadius : 0 };
    });
}

// ----------------- DOM-RELATED FUNCTIONS ------------------ //

export const getCheckedRadioButton = radioClass => {
    return Array.from(document.getElementsByClassName(radioClass))
        .map(button => button.checked ? button.getAttribute('id') : false)
        .filter(val => val !== false)[0];
};

export const getSelectedOption = idSelect => {
    const selectTag = document.getElementById(idSelect);
    if(selectTag.id =='selectContinent'){
        return selectTag.options[selectTag.value].id;
    }
    else {
        return Array.from(document.getElementsByClassName('option-continent selected'))
        .map(option => option.innerText);
    }
}

export const getCurrentYear = () => d3.select('#selected-year').text();

// ------------------------ EXPORTS --------------------------- //

export default {
    getCheckedRadioButton,
    computeCircleColor,
    computeCircleRadius,
    getTotalFromData,
    getSelectedData,
    getCurrentYear,
    valueToDiscreteTimeline,
    valueToDateTimeline,
    getSelectedOption
};

