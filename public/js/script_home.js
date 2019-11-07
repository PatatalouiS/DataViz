
'use strict';

// ------------ IMPORT AND CONSTANTS ---------------- //

import {dataURL, getData, Timer} from './utils.js';

const START_VALUES = {
    continent : 'Europe',
    year      : 2005
};

// -------------  UTILS LOCAL FUNCTIONS ------------- //

const getCheckedRadioButton = radioClass => {
    return Array.from(document.getElementsByClassName(radioClass))
        .map(button => button.checked ? button.getAttribute('id') : false)
        .filter(val => val !== false)[0];
};

const getActualCircleRadiusList = () => {
    return Array.from(document.querySelectorAll('circle'))
        .map(d => Object.assign({}, { radius : Number(d.getAttribute('r'))}));
};

const computeCircleColor = dataLine => {
    const {value} = dataLine;
    const ranges  = [50000, 150000, 250000, 500000, 1000000];
    const values  = ['#2ca02c', '#1f77b4', '#ff7f0e', '#d62728', '#8c564b'];

    for(let index in ranges) if(value <= ranges[index]) return values[index];
    return '#581845';
};

const computeCircleRadius = (dataLine) => {
    const {value} = dataLine;
    const ranges  = [ 1000, 5000, 50000, 100000, 150000, 200000,250000,300000,350000,400000,450000,500000,550000,600000,650000,700000,750000,800000,850000,900000,950000,10000000,20000000,3000000,5000000,15000000];
    const coeffs  = [ 10, 12, 15, 20, 30,40,45,50,55,60,65,70,75,80,85,90,100,105,110,112,115,130,150,170,200];

    for(let index in ranges) if(value <= ranges[index]) return coeffs[index];
    return false
}

// ------------------   HANDLERS FAMILY  ------------------ //

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

const updateRadius = ({newRadius, simulation, data, transitionDuration, indexTrigger, nodes}) => { 
    const circleTriggered = d3.select(nodes[indexTrigger].parentNode.firstChild);

    circleTriggered
        .transition()
        .duration(transitionDuration)
        .tween('radius', dataLine => {
            const interpolation = d3.interpolate(dataLine.radius, newRadius);

            return time => {
                dataLine.radius = interpolation(time)
                circleTriggered.attr('r', dataLine.radius);
                d3.select(nodes[indexTrigger]).attr('r', dataLine.radius);
                simulation.nodes(data)
            }
        })
    simulation.alpha(1).restart();
};

const showLargeBubble = (simulation, data, timer) => (dataTrigger, indexTrigger, nodes) => {
    if(dataTrigger.radius < 40) timer.set(setTimeout(() => updateRadius({
        newRadius : 75,
        simulation,
        data,
        transitionDuration : 400,
        indexTrigger,
        nodes
    }), 500));
};

const showInitialBubble = (simulation, data, timer) => (dataTrigger, indexTrigger, nodes) => {
    timer.clear();
    if(Number(computeCircleRadius(dataTrigger)) !== dataTrigger.radius) updateRadius({
        newRadius : computeCircleRadius(dataTrigger),
        simulation,
        data,
        transitionDuration : 400,
        indexTrigger, 
        nodes
    })
}

// ---------------  D3/GRAPH/DRAWING ------------- //

const drawChart = async (continent, year) => {

    const functionTab = {
        'Top' : () => `${dataURL}pollution/top10/${year}`,
        'World' : () => `${dataURL}pollution/top10/${year}`
    };

    // Fetch correct data on server
    const queryData = (continent === 'Top' || continent === 'World') 
        ? await getData(functionTab[continent]())
        : await getData(`${dataURL}pollution/bycontinent/${continent}/${year}`)
     
    const data = queryData.map(dataLine => Object.assign({}, dataLine, { radius : computeCircleRadius(dataLine)}));

    const width       = 1340;
    const height      = 1000;

    // Definition of the force Simulation, especially collapse force
    const s = 0.005;
    const timer = new Timer();
    const force = d3.forceSimulation(data)
        .force('x', d3.forceX(width/2).strength(s))
        .force('y', d3.forceY(height/2).strength(s))
        .force('center', d3.forceCenter(width/2, height/2))
        .force('collide', d3.forceCollide(d => d.radius))
        .on('tick', () => circles.attr('transform', d => `translate(${d.x},${d.y})`));

    const svg = d3.select('#chart')
        .append('svg')
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1340 1000")
        .classed("svg-content", true)
        .attr('id', 'svg')
        .append('g')
        .attr('transform','translate(2,2)');

    const circles = svg.selectAll('.node')
        .data(data)
        .enter()
            .append('g')
            .attr('id', 'cercle')
            .style("pointer-events","visible")
     
    circles.append('circle')
        .classed('node', true)
        .style("pointer-events","visible")
        .attr('class','Pays')
        .attr('r', dataLine => dataLine.radius)
        .attr('fill', computeCircleColor)

    circles.append('text')
        .attr('class','titrePays')
        .attr("dy", ".2em")
        .style("text-anchor", "middle")
        .attr("fill", "black")
        .text(d => d.name)
        .style('display', d => d.value > 150000 ? '' : 'none')
        .style("font-weight", "bold")
    
    circles.append('text')
        .attr("dy", "1.3em")
        .style("text-anchor", "middle")
        .attr("fill", "white")
        .text(d => new Intl.NumberFormat({ style: 'decimal'}).format(d.value))
        .style('display', d => d.value > 150000 ? '' : 'none')
        .style("font-weight", "bold")

    circles.append('circle')
        .attr('class','circle-container')
        .attr('fill', 'none')
        .attr('r', d => d.radius)
        .on('mouseover', showLargeBubble(force, data, timer))
        .on('mouseout', showInitialBubble(force, data, timer))

    circles.append('title')
        .text(d => {return d.name;} ) 

    const legende = svg
        .append('g')
        .attr('id', 'legende');
    
    let x = 220;   
    const colors  = ["#2ca02c", "#1f77b4", "#ff7f0e", "#d62728","#8c564b", "#581845"];
    const legendes = ["Pas polluant","Peu polluant","Polluant","Très polluant","Dangereux","Destructeur"]
    
    for( let i = 0; i < colors.length; i++) {
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

// ------------------- INITIAL STATE OF PAGE ------------- //

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
