
'use strict';


// ---------------------- IMPORTS AND CONSTANTS ---------------------------------- //

import { drawMenu, drawChart, drawTimeLine, drawTotal } from './draw.js';
import { getSelectedData, getMaxfromData, getTotalFromData } from './local_utils.js';
import { paramsChangedHandler, switchRepresentation } from './handlers.js';
import State from './state.js';
import { getData, countriesURL } from '../utils.js';

const START_VALUES = async () => ({
    place          : ['Europe'],
    year           : 1975,
    dataType       : 'total',
    placeType      : 'byContinent',
    countries      : await getData(countriesURL),   
    representation : 'bubble',
    chartSpecs     : {
        width  : 1500,
        height : 1100 
    }
});

// ------------------- INITIAL STATE OF PAGE ------------------------------------ // 

const init = async () => {
    const StateApp                            = new State(await START_VALUES());
    const data                                = await getSelectedData(StateApp);
    StateApp.setData(data);
    StateApp.setTotal(getTotalFromData(data));

    drawChart(StateApp);
    drawTimeLine(StateApp);
    drawTotal(StateApp);
    drawMenu(StateApp);

    document.getElementById(StateApp.getDataType()).checked = true;
    document.getElementById(StateApp.getPlaceType()).checked = true;
    document.getElementById(StateApp.getRepresentation()).checked = true;

    document.getElementById('selectContinent')
        .addEventListener('change', paramsChangedHandler(StateApp));    
    document.getElementById('selectCountry')
        .addEventListener('change', paramsChangedHandler(StateApp));

    Array.from(document.getElementsByClassName('radio-t'))
        .forEach(element => element.addEventListener('click', paramsChangedHandler(StateApp)));
    Array.from(document.getElementsByClassName('radio-choice'))
        .forEach(element => element.addEventListener('click', paramsChangedHandler(StateApp)));
    Array.from(document.getElementsByClassName('radio-rp'))
        .forEach(element => element.addEventListener('click', switchRepresentation(StateApp)));
};

// --------------------- MAIN ---------------------------------------------------- //

document.addEventListener('DOMContentLoaded', init);
