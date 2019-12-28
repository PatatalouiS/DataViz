
// ---------------------  IMPORTS  --------------------- //

import { Timer, dataURL, getData } from '../utils.js';
import { getTotalFromData, computeCircleColor, getMaxfromData,
         getAllDates, getSelectedOption, valueToDiscreteTimeline,getCheckedRadioButton,getCurrentYear} from './local_utils.js';
import {showLargeBubble, showInitialBubble, updateTimeLine, playButtonHandler, bubbleTransition} from './handlers.js'

// ----------------------- DRAWING DOM/SVG FUNCTIONS -------------------- //

export const drawTotal = data => {
    const width = 366
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
    
    console.log('je passe ici');
    pollu.append('text')
        .attr('id', 'total-title')
        .text(`Total : ${(getCheckedRadioButton('radio-choice')=='radio-continent') ? getSelectedOption('selectContinent') : getSelectedOption('selectCountry') }`)
        .attr('x','30')
        .attr('y','30')
        .style('font-weight', 'bold')
        
    pollu.append('text')
        .attr('id', 'total-value')
        .text(new Intl.NumberFormat('de-DE').format(getTotalFromData(data, 'value')))
        .attr('x','60')
        .attr('y','62')
        .style('font-weight', 'bold')
    
    console.log(getCheckedRadioButton('radio-t'))
    pollu.append('text')
        .text(() => getCheckedRadioButton('radio-t') == 'total' ? "*milliers de tonnes de CO2" : "*en tonne par habitant")
        .attr('x','30')
        .attr('y','90')
        .style('font-style', 'italic')
}

export const drawTimeLine = () => {
    const width              = 366;
    const height             = 120;
    const margin             = {right: 40, left: 40};
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
        .attr('id', 'line-timeline')
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr('class', 'track-inset')
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr('class', 'track-overlay')
        .call(d3.drag()
            .on('drag', () => updateTimeLine(valueToDiscreteTimeline(d3.event.x, rangeMax), rangeMax))
        );
        
    slider.insert('g','.track-overlay')
        .attr('class','ticks')
        .attr('transform','translate(0,' + 50 + ')')
        .selectAll('text')
        .data([dates[0], dates[2], dates[4], dates[7]])
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

let hauteurGraphPerCapita = 40;
let hauteurGraphTotal = 1000000;

export const drawChart = data => {
    const width        = 1300;
    const height       = 1100;
    let tranlatebubble = true;

    const select = getCheckedRadioButton('radio-rp');
    const type = getCheckedRadioButton('radio-t');
  
    const xscale = d3.scaleLinear()
        .domain([1970, 2015])
        .range([0, width - 250]);

    
    var maxValue = () => (type == 'total') ? hauteurGraphTotal : hauteurGraphPerCapita;
   

    const yscale = d3.scaleLinear()
        .domain([0,maxValue()])
        .range([height - 200, 0]);

    const ysccaleres = value => yscale(value) + 110;

    const posYear = () => {
        if (getCurrentYear() == '1975') return 290;
        if (getCurrentYear() == '1985') return 520;
        if (getCurrentYear() == '1995') return 750;
        if (getCurrentYear() == '2005') return 980;
        if (getCurrentYear() == '2010') return 1110;
        if (getCurrentYear() == '2012') return 1130;
        if (getCurrentYear() == '2013') return 1140;
        else return 1150;
    }
 
    
    // Definition of the force Simulation, especially collapse force
    const s = 0.005;
    const timer = new Timer();
    const force = d3.forceSimulation(data)
        .force('x', d3.forceX(width/2).strength(s))
        .force('y', d3.forceY(height/2).strength(s))
        .force('center', d3.forceCenter(width/2, height/2))
        .force('collide', d3.forceCollide(dataLine => dataLine.finalRadius))
        .on('tick', () => circles.attr('transform', d => {
            if (tranlatebubble){
                return `translate(${d.x},${d.y})`
            }else{
               //console.log('translate('+xscale(d.year)+','+yscale(d.value)+')') 
               
               return 'translate('+posYear()+','+ysccaleres(d.value)+')'
            }                
                
        }));

    const svg = d3.select('#chart')
        .append('svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', '0 0 1300 1100')
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
     
    circles.append('circle')
        .classed('node', true)
        .attr('class','Pays')
        .attr('r', dataLine => dataLine.currentRadius)
        .attr('fill', dataLine => computeCircleColor(dataLine/*, getMaxfromData(data, 'value')*/))
        .on('mouseover', showLargeBubble(force, data, timer))
        .on('mouseout', showInitialBubble(force, data, timer))
        .transition()
            .duration(2000)
            .tween('currentRadius', bubbleTransition(force, data));

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
        .attr('fill', 'white')
        .style('font-weight', 'bold')
        .style('font-size','20px')
        .text(d => d.name.replace(/\(.[^(]*\)/g,''))
        .style('display', d => d.radius < ((select == 'graph') ? 40 : 70) ? 'none' : '');
    
    circles.append('text')
        .attr('class','titrePaysGraphe')
        .attr('dx',/* () => (getCurrentYear() == '2010') ? */'-12em'/* : '4em'*/)
        .attr('fill', 'black')
        .style('font-weight', 'bold')
        .style('font-size','20px')
        .text(d => d.name.replace(/\(.[^(]*\)/g,''))
        .style('display', () => (select == 'graph')? '' : 'none');
    
    textContainers.append('text')
        .attr('dy', '1.3em')
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .attr('fill', 'white')
        .text(d => new Intl.NumberFormat('de-DE').format(d.value))
        .style('display', d => d.radius < ((select == 'bubble') ? 40 : 70) ? 'none' : '')
        .style('font-weight', 'bold')
        .style('font-size','20px')

    textContainers.append('title')
        .text(dataLine => dataLine.name)
        .style('pointer-events', 'none'); 

    /****************** Representation avec graph ****************************/
    console.log(getCheckedRadioButton('radio-rp'))
    if (select == 'graph') {
        tranlatebubble = false;
        svg.append("g")
        .attr('id',"graph")
        
        svg.append("g")
        .attr('transform','translate(170,'+ height/1.1 +')')
        .style('font-weight', 'bold')
        .style('font-size','20px')
        .call(d3.axisBottom(xscale));

        svg.append("g")
        .attr('transform','translate(170,110)')
        .style('font-weight', 'bold')
        .style('font-size','20px')
        .call(d3.axisLeft(yscale));


        /*circles.append('circleGraph')
        .classed('node', true)
        .attr('class','Pays')
        .attr()
        .attr('r', '30')
        .attr('fill', dataLine => computeCircleColor(dataLine/*, getMaxfromData(data, 'value')*//*))
        .on('mouseover', showLargeBubble(force, data, timer))
        .on('mouseout', showInitialBubble(force, data, timer))
        .transition()
            .duration(2000)
            .tween('currentRadius', bubbleTransition(force, data));*/

        d3.select('#button-moins')
            .on('click', () => {
                if(type == 'total' && hauteurGraphTotal < 12000000) return (hauteurGraphTotal = hauteurGraphTotal + 100000)
                if(type =='per-capita' && hauteurGraphPerCapita < 50) return (hauteurGraphPerCapita = hauteurGraphPerCapita + 10)
                })
        d3.select('#button-plus')
            .on('click', () =>{
                if(type == 'total'&& hauteurGraphTotal > 100000) return (hauteurGraphTotal = hauteurGraphTotal - 100000)
                if(type =='per-capita' && hauteurGraphPerCapita > 10) return (hauteurGraphPerCapita = hauteurGraphPerCapita - 10)
            });
        

    }
};

export const drawGraph = data => {
     
    const width        = 1300;
    const height       = 1000;
    let tranlatebubble = true;

    const select = getCheckedRadioButton('radio-rp');
    const type = getCheckedRadioButton('radio-t');
  
    const x = d3.scaleLinear()
        .domain([1970, 2015])
        .range([0, width - 250]);

    const y = d3.scaleLinear()
        .domain([0, type == 'total' ? 1000000/*d => {getMaxfromData(d,'value')}*/ : 50])
        .range([height - 200, 0]);

    const svg = d3.select('#chart')
        .append('svg')
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr('viewBox', '0 0 1300 1000')
        .classed('svg-content', true)
        .attr('id', 'svg')
        .append('g')
        .attr("id","chartgroup")
        .attr('transform','translate(2,2)')
    
    svg.append("g")
        .attr('id',"graph")
    
    svg.append("g")
        .attr('transform','translate(170,'+ height/1.1 +')')
        .style('font-weight', 'bold')
        .style('font-size','20px')
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr('transform','translate(170,110)')
        .style('font-weight', 'bold')
        .style('font-size','20px')
        .call(d3.axisLeft(y));

        const circles = svg.selectAll('.node')
        .data(data)
        .enter()
            .append('g')
            .attr('id', 'cercle')
     
    circles.append('circle')
        .classed('node', true)
        .attr('class','Pays')
        .attr("cx", function (d) { return x(d.year); } )
        .attr("cy", function (d) { return y(d.value); } )
        .attr('r', '50')
        .attr('fill', dataLine => computeCircleColor(dataLine/*, getMaxfromData(data, 'value')*/))



};

export const drawLegend = () => {
    const width    = 1127;
    const height   = 100;
    const colors   = ['#2ca02c', '#cbdc01','#1f77b4', '#ff7f0e', '#d62728','#8c564b', '#581845'];
    const legendes = ['Pas polluant','tres peu polluant','Peu polluant','Polluant','Très polluant','Dangereux','Destructeur']
    const legende = d3.select('#legend')
        .append('svg')
        .attr('width', width)
        .attr('height',height)
        .attr('id', 'legende');

    var x = 45;   

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
    console.log(countriesNames)

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

    $("#selectCountry").prop("disabled", true);
        
    $("#radio-country").click(() => {
        $('#selectCountry').prop("disabled", false);
        $("#selectContinent").prop("disabled", true);
    });

    $("#radio-continent").click(() => {
        $('#selectContinent').prop("disabled", false);
        $("#selectCountry").prop("disabled", true);
        
    });
}; 

// ------------------------ EXPORTS --------------------------- //

export default {
    drawChart,
    drawLegend,
    drawMenu,
    drawTimeLine,
    drawTotal,
    drawGraph,
};
