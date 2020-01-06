
'use strict';

// ---------------------  IMPORTS AND CONSTANTS  --------------------------------- //
import { getData, dataURL, interpolationTabNumber } from '../utils.js';

// Define here your valueKey to bind from data Server
const mainValueKeyNames = {
    'total'     : 'value',
    'per-capita': 'valuePerCapita'
};

const dates = [1975, 1985, 1995, 2005, 2010, 2012, 2013, 2014];

// -------------------- COMPUTING VALUE, GET PROJECT CONSTANTS  -------------------- //

export const getMainValue = dataType => {
    try {
        if(!mainValueKeyNames.hasOwnProperty(dataType)) throw new Error();
        return mainValueKeyNames[dataType];
    }
    catch (err) {
        console.err(`There is no MainValue field for dataType '${dataType}'`);
    }
}

export const computePlaceText = StateApp => {
    const placeType = StateApp.getPlaceType();

    return ({
        'Top10' : 'Top10',
        'byCountry' : 'Sélection Pays',
        'byContinent' : StateApp.getPlace()[0]
    })[placeType];
}

// -------------------- ASSIGN COLOR AT CIRCLE -------------------------------------//
export const computeCircleColor = (dataLine, dataType) => {
    const {value} = dataLine;
    const colorScale = d3.scaleQuantize()
        .domain([0, dataType === 'total' ? 1000000 : 25])
        .range(['#2ca02c','#cbdc01', '#1f77b4','#ff7f0e', '#d62728', '#8c564b','#581845']);
    return colorScale(value);
};

// -------------------- ASSIGN RADIUS AT CIRCLE -------------------------------------//
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

export const getTotalFromData = (data, field = 'value') => {
    return data
        .reduce((total, dataLine) => total + dataLine[field] , 0);
};

export const getMaxfromData = (data, field = 'value') => {
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

    const dataType = StateApp.getDataType();
    const selecting = (descrpt) =>{ return d3.select("#description").text(descrpt)}
    const description_1 = "*milliers de tonnes de CO2"
    const description_2 = "*en tonne par habitant"

    if (dataType === "per-capita")  selecting(description_2)
    else  selecting(description_1)
};

// ---------------------- FETCH AND DATA RELATED FUNCTIONS --------------------------- //

export const getSelectedData = async StateApp => {
    const { placeType, dataType, place, year } = StateApp.getFetchParams();
    const url                                  = `${dataURL}/${dataType}/${placeType}`; 
    let data;

    if(placeType === 'Top10') data = await getData(`${url}/${year}`);
    else if(placeType === 'byContinent') data = await getData(`${url}/${place[0]}/${year}`);
    else {
        data = await Promise.all(place.map(country => getData(`${url}/${country}/${year}`)))
            .then(tab => tab.flat())
            .then(data => data.map((dataLine, index) => {
                if(dataLine === undefined) {
                    const country = place[index];
                    alert(`Pas de données existantes pour le pays ${country}, année ${year}`);
                    document.getElementById(`option-country-${country}`).selected = false;
                    $('.selectpicker').selectpicker('refresh');
                }
                return dataLine;
            }))
            .then(data => data.filter(dataLine => dataLine !== undefined))
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
            const finalColor = computeCircleColor({value}, StateApp.getDataType());
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

// ---------------------- DOM-RELATED FUNCTIONS -------------------------------------- //

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

// ------------------------ EXPORTS ---------------------------------------------- //

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
    getMainValue,
    computePlaceText
};

