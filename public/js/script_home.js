
'use strict';

// ------------ IMPORT AND CONSTANTS ---------------- //

import {dataURL, getData} from './utils.js';

const START_VALUES = {
    continent : 'Europe',
    year      : 2005
};

// -------------  UTILS LOCAL FUNCTIONS ------------- //

// return the ID of checked radio button identified by a classname string of radio buttons
const getCheckedRadioButton = radioClass => {
    return Array.from(document.getElementsByClassName(radioClass))
        .map(button => button.checked ? button.getAttribute('id') : false)
        .filter(val => val !== false)[0];
};

// ------------------   HANDLERS ------------------ //

const attachHandlers = () => {
    Array.from(document.getElementsByClassName('radio'))
        .forEach(radioButton => radioButton.addEventListener('click', paramsChangedHandler));
};

const paramsChangedHandler = () => {
    const continent = getCheckedRadioButton('radio-c');
    const year      = getCheckedRadioButton('radio-y');
    const svg       = document.getElementById('svg');

    if(svg) svg.remove();
    drawChart(continent, year);
};

// ---------------  D3/GRAPH/DRAWING ------------- //

const computeCircleColor = dataLine => {
    const {value} = dataLine;
    const ranges  = [50000, 150000, 250000, 500000, 1000000];
    const values  = ['#2ca02c', '#1f77b4', '#ff7f0e', '#d62728', '#8c564b'];

    for(let index in ranges) {
        if(value <= ranges[index]) {
            return values[index];
        }
    }
    return '#581845';
};

const computeCicleRadius = dataLine => {
    const {value} = dataLine;
    const ranges  = [ 50, 1000, 50000, 250000, 500000, 5000000];
    const coeffs  = [ 5, 500, 2000, 5000, 5000, 5000];
    let chosen    = null;

    ranges.some((range, index) => {
         if(value < range) { chosen = coeffs[index]; return true; }
         else return false;  
    })

    if(!chosen) chosen = 20000;
    if(value <= 10000 ) return 10;
    else return value / chosen;
}

const drawChart = async (continent, year) => {
    const data        = await getData(`${dataURL}pollution/bycontinent/${continent}/${year}`);
    const width       = 1340;
    const height      = 500;

    const svg = d3.select('#chart')
        .append('svg')
        .attr('height',height)
        .attr('width',width)
        .attr('id', 'svg')
        .append('g')
        .attr('transform','translate(2,2)');

    const simulation = d3.forceSimulation()
        .force('x',d3.forceX(width/2).strength(0.05))
        .force('y',d3.forceY(height/2).strength(0.05))
        .force('collide',d3.forceCollide(computeCicleRadius));

    const circles = svg.selectAll('.bdd')
        .data(data)
        .enter()
            .append('g')
            .attr('id', 'cercle')

    circles.append('circle')
        .attr('class','Pays')
        .attr('r', computeCicleRadius)
        .attr('fill', computeCircleColor)

    circles.append('text')
        .attr('color', 'black')
        .text(d => d.name);
    
    simulation.nodes(data)
        .on('tick', () => circles.attr('transform', d => `translate(${d.x},${d.y})`));
};

// ------------------- INIT FUNCTIONS ------------- //

const init = () => {
    const {continent, year}                    = START_VALUES;
    document.getElementById(continent).checked = true;
    document.getElementById(year).checked      = true;
    drawChart(continent, year);
};

// --------------------   MAIN   ------------------- //

document.addEventListener('DOMContentLoaded', () => {
    attachHandlers();
    init();
});
