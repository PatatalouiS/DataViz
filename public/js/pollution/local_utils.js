
// ---------------------  IMPORTS AND CONSTANTS  --------------------- //

import { getData, dataURL, interpolationTabNumber } from '../utils.js';

// Define here your valueKey to bind from data Server
const mainValueKeyNames = {
    'total'     : 'value',
    'per-capita': 'valuePerCapita'
};

const dates = [1975, 1985, 1995, 2005, 2010, 2012, 2013, 2014];

// ------------------  COMPUTING VALUE, GET PROJECT CONSTANTS  -------------------- //

export const getMainValue = dataType => {
    try {
        if(!mainValueKeyNames.hasOwnProperty(dataType)) throw new Error();
        return mainValueKeyNames[dataType];
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

export const computeCircleRadius = (dataLine, maxValue, representation) => {
    const {value} = dataLine;
    if(value === 0) return 0;
    else if(representation == 'graph') return 20;
    else {
        const linearScale = d3.scaleSqrt()
            .domain([0, maxValue])
            .range([20, 150]);
        return linearScale(value);
    }    
};

export const getTotalFromData = (data, field) => {
    return data
        .reduce((total, dataLine) => total + dataLine[field] , 0);
};

export const getMaxfromData = (data, field) => {
    return data
        .reduce((max, dataLine) => dataLine[field] > max ? dataLine[field] : max, 0);
};

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
    return Number(valueToDate(value));
}

export const updateData = (StateApp, lastData, newData) => {
    StateApp.getData().forEach((dataLine, index) => {
        dataLine.finalRadius = newData[index].finalRadius;
        dataLine.lastRadius = lastData[index].radius;
        dataLine.value = newData[index].value;
        dataLine.lastValue = lastData[index].showedValue;
        dataLine.lastColor = dataLine.value === 0 
            ? newData[index].finalColor
            : lastData[index].finalColor;
        dataLine.finalColor = dataLine.value === 0 
            ? lastData[index].finalColor
            : newData[index].finalColor;
    });
};

// --------------------  FETCH AND DATA RELATED FUNCTIONS --------------------- //

export const getSelectedData = async StateApp => {
    const url = `${dataURL}pollution`;
    const { placeType, dataType, place, year } = StateApp.getFetchParams(); 
    let data;

    if(place[0] === 'Top') data = await getData(`${url}/${dataType}/top10/${year}`);
    else if(placeType === 'byContinent') data = await getData(`${url}/${dataType}/bycontinent/${place[0]}/${year}`);
    else {
        data = await Promise.all(place.map(async country => {
            const countryData = await getData(`${url}/${dataType}/bycountry/${country}/${year}`);
            if(countryData === undefined) alert(`Pas de données existantes pour le pays ${country}, année ${year}`);
            return countryData;
        }));
        data = data.flat();
    }

    return formatData(data, StateApp);
};

export const formatData = (data, StateApp) => {
    const valueKeyName = mainValueKeyNames[StateApp.getDataType()];
    const maxValue = getMaxfromData(data, valueKeyName);

    
    
    return StateApp.getCountries().map(country => {
        const dataLine = data.find(dataLine => dataLine.name == country.name);
        if(dataLine) {
            const value = dataLine[valueKeyName];
            const finalRadius = computeCircleRadius({value}, maxValue, StateApp.getRepresentation());
            const finalColor = computeCircleColor({value});
            delete dataLine[valueKeyName];
            

            return Object.assign(dataLine, { 
                value, 
                lastValue : 0,
                showedValue : 0,
                radius : 0,
                lastRadius : 0,
                finalRadius,
                color : '',
                lastColor : '',
                finalColor
            });  
        } 
        else return {
            name : country.name,
            value : 0,
            lastValue : 0,
            showedValue : 0,
            color : '',
            radius : 0,
            lastRadius : 0,
            finalRadius : 0,
            color : '',
            lastColor : '',
            finalColor : ''
        };
    }); 
};

// ----------------- DOM-RELATED FUNCTIONS ------------------ //

export const getCheckedRadioButton = radioClass => {
    return Array.from(document.getElementsByClassName(radioClass))
        .map(button => button.checked ? button.getAttribute('id') : false)
        .filter(val => val !== false)[0];
};

export const getSelectedOption = idSelect => {
    const selectTag = document.getElementById(idSelect);
    if(idSelect === 'selectContinent'){
        return [selectTag.options[selectTag.selectedIndex].id];
    }
    else {
        return Array.from(document.getElementsByClassName('option-country selected'))
        .map(option => option.innerText);
    }
};

export const getCurrentYear = () => Number(d3.select('#selected-year').text());

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
    getSelectedOption,
    updateData,
    getMainValue
};

