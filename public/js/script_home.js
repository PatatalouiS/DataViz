
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
    const coeffs  = [ 5, 500, 2000, 5000, 5000, 60000];
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
    const height      = 1000;

    const svg = d3.select('#chart')
        .append('svg')
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1340 1000")
        .classed("svg-content", true)
        .attr('id', 'svg')
        .append('g')
        .attr('transform','translate(2,2)');
    
    const simulation = d3.forceSimulation()
        .force('x',d3.forceX(width/2).strength(0.05))
        .force('y',d3.forceY(height/2).strength(0.05))
        .force('collide',d3.forceCollide(computeCicleRadius));
    
    var div = svg.append("div")
        .attr("class", "tooltip-donut")
        .style("opacity", 0);

    const circles = svg.selectAll('.bdd')
        .data(data)
        .enter()
            .append('g')
            .attr('id', 'cercle')
            .on('mouseover', function (d, i) {
                d3.select(this).transition()
                     .duration('50')
                     .attr('opacity', '.85')
                div.transition()
                     .duration('50')
                     .style("opacity", 1);
                div.html(d.value)})
                   
            .on('mouseout', function (d, i) {
                d3.select(this).transition()
                     .duration('50')
                     .attr('opacity', '1')
                div.transition()
                     .duration('50')
                     .style("opacity", 0)})
            

    circles.append('circle')
        .attr('class','Pays')
        .attr('r', computeCicleRadius)
        .attr('fill', computeCircleColor)
        

    circles.append('text')
        .attr("dy", ".2em")
        .style("text-anchor", "middle")
        .attr("fill", "black")
        .text(d => {
            if(d.value > 100000) { return d.name; }
            else return "";})
        .style("font-weight", "bold");
    
    circles.append('text')
        .attr("dy", "1.3em")
        .style("text-anchor", "middle")
        .attr("fill", "white")
        .text(d => {
            if(d.value > 100000) { return d.value; }
            else return "";});

    circles.append('title')
        .text(d => {return d.name} )
        .text(d => {return d.value} )
        

    simulation.nodes(data)
        .on('tick', () => circles.attr('transform', d => `translate(${d.x},${d.y})`));

    const legende = svg
        .append('g')
        .attr('id', 'legende')
    
    let x = 220;
    const posx = []
    
    const colors  = ["#2ca02c", "#1f77b4", "#ff7f0e", "#d62728","#8c564b", "#581845"];
    const legendes = ["Pas polluant","Peu polluant","Polluant","Très polluant","Dangereux","Destructeur"]
    
    for ( let i = 0; i< 6; i++){
        legende
            .append('rect')
            .attr("width", "150")
            .attr("height", "30")
            .attr("x", x)
            .attr("y","30")
            .attr("fill", colors[i]);     
        legende
            .append('text')
            .attr("x",x + 75)
            .attr("y","50")
            .attr("fill","white")
            .text(legendes[i])
            .attr("text-anchor", "middle")
            x += 150;
    }
    
    
    
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
