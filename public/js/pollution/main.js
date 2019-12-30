
'use strict';

// ------------ IMPORT AND CONSTANTS ---------------- //

import { drawMenu, drawLegend, drawChart, drawTimeLine, drawTotal } from './draw.js';
import { getSelectedData } from './local_utils.js';
import { paramsChangedHandler } from './handlers.js';
import { getHOST } from '../utils.js';
import State from './State.js';


const START_VALUES = {
    continent : 'Europe',
    year      : 1975,
    dataType  : 'total'
};

// ------------------- INITIAL STATE OF PAGE ------------- // 

const init = async () => {
    const {continent, year, dataType}         = START_VALUES;
    document.getElementById(dataType).checked = true;
    const data                                = await getSelectedData(continent, year, dataType);
    const StateApp                            = new State(Object.assign(START_VALUES, { data }));

    drawMenu();
    drawLegend();
    drawChart(StateApp);
    drawTimeLine(StateApp);
    drawTotal(StateApp);

    document.getElementById('selectContinent')
        .addEventListener('change', paramsChangedHandler(StateApp));   

    Array.from(document.getElementsByClassName('radio-t'))
        .forEach(element => element.addEventListener('click', paramsChangedHandler(StateApp)));
};

// --------------------   MAIN   ------------------- //

document.addEventListener('DOMContentLoaded', () => {
    if(getHOST() !== 'localhost:8080') console.log = () => {};
    init();
});