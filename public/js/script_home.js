
'use strict';

import {dataURL, getData} from './utils.js';

const continentHandler = continent => {
    const svg = document.getElementById('svg');
    if(svg) svg.remove();
    drawChart(continent);
};

const init = () => {
    const continents = ['Europe', 'Asie', 'Africa', 'NorthAmerica', 'SouthAmerica', 'Oceania'];
    document.getElementById('Europe').checked = true;

    continents.forEach(continent => {
        document.getElementById(continent).addEventListener('click', () => continentHandler(continent));
    });
};

const createAxe = () => {
};

const computeCircleColor = dataLine => {
    const {value} = dataLine;
    const ranges = [50000, 150000, 250000, 500000, 1000000];
    const values = ['#2ca02c', '#1f77b4', '#ff7f0e', '#d62728', '#8c564b'];

    for(let index in ranges) {
        if(value <= ranges[index]) {
            return values[index];
        }
    }
    return '#581845';
};

const computeCicleRadius = dataLine => {
    const {value} = dataLine;
    const ranges = [ 50, 1000, 50000, 250000, 500000, 5000000];
    const coeffs = [ 5, 500, 2000, 5000, 5000, 5000];
    let chosen = null;

    ranges.some((range, index) => {
         if(value < range) { chosen = coeffs[index]; return true; }
         else return false;  
    })

    if(!chosen) chosen = 20000;
    if(value <= 10000 ) return 10;
    else return value / chosen;
}

const drawChart = async continent => {
    const data = await getData(`${dataURL}pollutsion/bycontinent/${continent}`);
    const data2005 = data.filter(d => d.year === 2005);
    const width = 1340;
    const height = 500;
    const sizeBalloon = 4000;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("height",height)
        .attr("width",width)
        .attr('id', 'svg')
        .append("g")
        .attr("transform","translate(2,2)");

    const simulation = d3.forceSimulation()
        .force('x',d3.forceX(width/2).strength(0.05))
        .force('y',d3.forceY(height/2).strength(0.05))
        .force("collide",d3.forceCollide(computeCicleRadius));

    const circles = svg.selectAll('.bdd')
        .data(data2005)
        .enter()
            .append('g')
            .attr("id", 'cercle')

    circles.append('circle')
        .attr("class","Pays")
        .attr("r", computeCicleRadius)
        .attr("fill", computeCircleColor)

    circles.append('text')
        .attr('color', 'black')
        .text(d => d.name);
    
    simulation.nodes(data2005)
        .on('tick', () => {
            circles.attr("transform", d => "translate(" + d.x + "," + d.y + ")");
        });
};

// ----------   MAIN   ------------ //

document.addEventListener('DOMContentLoaded', () => {
    init();
    drawChart('Europe');
});
