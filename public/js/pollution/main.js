
'use strict';

// ------------ IMPORT AND CONSTANTS ---------------- //

import {drawMenu, drawLegend, drawChart, drawTimeLine,drawBouton} from './draw.js';
import {getSelectedData} from './local_utils.js';
import {paramsChangedHandler} from './handlers.js';


const START_VALUES = {
    continent : 'Asie',
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
    drawBouton();

   /* Array.from(document.getElementsByClassName('radio-c'))
        .forEach(radioButton => radioButton.addEventListener('click', paramsChangedHandler)); */
    var a = document.getElementById('selectOption')
    a.addEventListener('change', paramsChangedHandler, false);
     
};

// --------------------   MAIN   ------------------- //

document.addEventListener('DOMContentLoaded', () => {
    init();
});
