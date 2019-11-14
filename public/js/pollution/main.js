
'use strict';

// ------------ IMPORT AND CONSTANTS ---------------- //

import {drawMenu, drawLegend, drawChart, drawTimeLine} from './draw.js';
import {getSelectedData} from './local_utils.js';
import {paramsChangedHandler} from './handlers.js';


const START_VALUES = {
    continent : 'Europe',
    year      : 1975,
    dataType  : 'total'
};

// ------------------- INITIAL STATE OF PAGE ------------- //

const init = async () => {
    const {continent, year, dataType}          = START_VALUES;
    document.getElementById(continent).checked = true;
    document.getElementById(year).checked      = true;
    document.getElementById(dataType).checked  = true;

    const data = await getSelectedData(continent, year, dataType);

    drawChart(data);
    drawLegend();
    drawMenu(data);
    drawTimeLine(data);

    Array.from(document.getElementsByClassName('custom-control-input'))
        .forEach(radioButton => radioButton.addEventListener('click', paramsChangedHandler));  
};

// --------------------   MAIN   ------------------- //

document.addEventListener('DOMContentLoaded', () => {
    init();
});
