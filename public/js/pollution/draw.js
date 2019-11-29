
// ---------------------  IMPORTS  --------------------- //

import { Timer, dataURL, getData } from '../utils.js';
import { getTotalFromData, computeCircleColor, getMaxfromData,
         getAllDates, getSelectedOption, valueToDiscreteTimeline,getCheckedRadioButton} from './local_utils.js';
import {showLargeBubble, showInitialBubble, updateTimeLine, playButtonHandler} from './handlers.js'

// ----------------------- DRAWING DOM/SVG FUNCTIONS -------------------- //

export const drawTotal = data => {
    const width = 279
    const height = 100

    const svg = d3.select('#vis')
        .append('svg')
        .attr('width', width)
        .attr('height',height)

    const pollu = svg
        .append('g')
        .attr('id','wp')

    pollu.append('rect')
        .attr('width', '150')
        .attr('height', '30')
        .attr('x', '30')
        .attr('y','40')
        .attr('fill', 'white')
        .attr('stroke', 'grey')
        .attr('stroke-width','2')
        
    pollu.append('text')
        .attr('id', 'total-title')
        .text(`Total : ${getSelectedOption('selectOption')}`)
        .attr('x','30')
        .attr('y','30')
        .style('font-weight', 'bold')
        
    pollu.append('text')
        .attr('id', 'total-value')
        .text(new Intl.NumberFormat('de-DE').format(getTotalFromData(data, 'value')))
        .attr('x','60')
        .attr('y','62')
        .style('font-weight', 'bold')
}

export const drawTimeLine = () => {
    const width              = 279;
    const height             = 120;
    const margin             = {right: 10, left: 10};
    const rangeMax           = width - margin.left - margin.right;
    const dates              = getAllDates();
    const startDate          = dates[0];
    const endDate            = dates[dates.length-1];
    const targetValue        = rangeMax;

    const svg = d3.select('#timeLine')
        .append('svg')
        .attr('id', 'timeline')
        .attr('width', width)
        .attr('height',height)
        
    const playButton = d3.select('#play-button')
        .on('click', () => playButtonHandler(playButton, rangeMax));
  
    const slider = svg.append('g')
        .attr('class','slider')
        .attr('transform', 'translate(' + margin.left + ',' + height/2 + ')');

    slider.append('line')
        .attr('class','track')
        .attr('x1', 0)
        .attr('x2', rangeMax)
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr('class', 'track-inset')
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr('class', 'track-overlay')
        .call(d3.drag()
            .on('drag', () => updateTimeLine(valueToDiscreteTimeline(d3.event.x)))
        );
        
    slider.insert('g','.track-overlay')
        .attr('class','ticks')
        .attr('transform','translate(0,' + 50 + ')')
        .selectAll('text')
        .data([dates[0], dates[2], dates[4], dates[6]])
        .enter()
            .append('text')
            .attr('x', (d, i) => (rangeMax/3) * i )
            .attr('y', -30)
            .attr('font-size','75%')
            .attr('text-anchor','middle')
            .text(d => d);
        
    const handle = slider.insert('circle', '.track-overlay')
        .attr('id', 'handle')
        .attr('class', 'handle')
        .attr('r', 9)
        .attr('cx', 0);
    
    const label = slider.append('text')
        .attr('class','label')
        .attr('id', 'selected-year')
        .attr('text-anchor','middle')
        .attr('year', '1975')
        .text(startDate)
        .attr('transform', 'translate(10,' + (-25) + ')')  
}

export const drawChart = data => {
    const width    = 1200;
    const height   = 900;

    // Definition of the force Simulation, especially collapse force
    const s = 0.005;
    const timer = new Timer();
    const force = d3.forceSimulation(data)
        .force('x', d3.forceX(width/2).strength(s))
        .force('y', d3.forceY(height/2).strength(s))
        .force('center', d3.forceCenter(width/2, height/2))
        .force('collide', d3.forceCollide(dataLine => dataLine.finalRadius))
        .on('tick', () => circles.attr('transform', d => `translate(${d.x},${d.y})`));

    const svg = d3.select('#chart')
        .append('svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', '0 0 1200 900')
        .classed('svg-content', true)
        .attr('id', 'svg')
        .append('g')
        .attr("id","chartgroup")
        .attr('transform','translate(2,2)')
       
    const circles = svg.selectAll('.node')
        .data(data)
        .enter()
            .append('g')
            .attr('id', 'cercle')
     
    function animation (dataLine, index , nodes) {
        const circle = d3.select(nodes[index]);
        const interpolation = d3.interpolate(dataLine.currentRadius, dataLine.finalRadius);
        return time => {
            dataLine.currentRadius = interpolation(time)
            circle.attr('r', dataLine.currentRadius);

            const textOfcircle = d3.select(nodes[index].parentNode.children[1]);

            if(dataLine.currentRadius >= 40 && textOfcircle.style('display') == 'none' ) {  
               textOfcircle.style('display', '');    
            }
            force.nodes(data)
        }  
    }

    circles.append('circle')
        .classed('node', true)
        .attr('class','Pays')
        .attr('r', dataLine => dataLine.currentRadius)
        .attr('fill', dataLine => computeCircleColor(dataLine/*, getMaxfromData(data, 'value')*/))
        .on('mouseover', showLargeBubble(force, data, timer))
        .on('mouseout', showInitialBubble(force, data, timer))
        .transition()
            .duration(2000)
            .tween('currentRadius', animation);

    circles.append('g')
        .attr('class', 'text-description')
        .attr('id', dataLine => `bubble-text-${dataLine.index}`)
        .style('display', dataLine => dataLine.currentRadius < 40 ? 'none' : '');
        
    const textContainers = d3.selectAll('.text-description');

    textContainers.append('text')
        .attr('class','titrePays p')
        .attr('dy', '.2em')
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .attr('fill', 'black')
        .style('font-weight', 'bold')
        .text(d => d.name.replace(/\(.[^(]*\)/g,''));
    
    textContainers.append('text')
        .attr('dy', '1.3em')
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .attr('fill', 'white')
        .style('font-weight', 'bold')
        .text(d => new Intl.NumberFormat('de-DE').format(d.value))

    textContainers.append('title')
        .text(dataLine => dataLine.name)
        .style('pointer-events', 'none'); 

    /***************** Representation avec graph ***************************/

    /*const representation = getCheckedRadioButton('radio-rp')
    if (representation) {
        svg.remove();
        var scale = d3.scaleLinear()
                  .domain([0, 12000000])
                  .range([0, 150]);

        // Add scales to axis
        var x_axis = d3.axisBottom()
                    .scale(scale);

        var y_axis = d3.axisLeft()
            .scale(scale);

        //Append group and insert axis
        svg.append("g")
        .call(x_axis)
        .call(y_axis);
    }*/
};

export const drawLegend = () => {
    const width    = 1157;
    const height   = 100;
    const colors   = ['#2ca02c', '#1f77b4', '#ff7f0e', '#d62728','#8c564b', '#581845'];
    const legendes = ['Pas polluant','Peu polluant','Polluant','Très polluant','Dangereux','Destructeur']
    const legende = d3.select('#legend')
        .append('svg')
        .attr('width', width)
        .attr('height',height)
        .attr('id', 'legende');

    let x = 220;   

    for( let i = 0; i < colors.length; i++) {
        legende
            .append('rect')
            .attr('width', '150')
            .attr('height', '30')
            .attr('x', x)
            .attr('y','30')
            .attr('fill', colors[i]);     
        legende
            .append('text')
            .attr('x',x + 75)
            .attr('y','50')
            .attr('fill','white')
            .text(legendes[i])
            .attr('text-anchor', 'middle');
            x += 150;     
    }
};

export const drawMenu = async () => {
    const countriesNames = await getData(`${dataURL}utils/countriesnames`);
    const selectTag = document.getElementById('Pays');

    countriesNames.forEach(({name}) => {
                const newOption = document.createElement('option');
                newOption.innerHTML = name.replace(/\(.[^(]*\)/g,'');
                newOption.classList = 'option-country'
                selectTag.appendChild(newOption);
    });

    $('.selectpicker').selectpicker('refresh');

    const selectCountry = document.getElementsByClassName('scountry')[1]
    const selectContinent = document.getElementsByClassName('sContinent')[1];
    const radiocheck = getCheckedRadioButton('radio-choice');
    
    if (radiocheck == 'radio-continent'){
        selectCountry.setAttribute('disabled', 'disabled')
        selectContinent.removeAttribute('disabled')
    }
    if (radiocheck == 'radio-country'){
        selectContinent.setAttribute('disabled', 'disabled')
        selectCountry.removeAttribute('disabled')
    }
}; 

// ------------------------ EXPORTS --------------------------- //

export default {
    drawChart,
    drawLegend,
    drawMenu,
    drawTimeLine,
    drawTotal,
};
