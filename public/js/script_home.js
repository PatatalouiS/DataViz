
'use strict';

// ------------ IMPORT AND CONSTANTS ---------------- //

import {dataURL, getData} from './utils.js';

const START_VALUES = {
    continent : 'Europe',
    year      : 1975
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
    Array.from(document.getElementsByClassName('custom-control-input'))
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
    const ranges  = [ 1000, 5000, 50000, 100000, 150000, 200000,250000,300000,350000,400000,450000,500000,550000,600000,650000,700000,750000,800000,850000,900000,950000,10000000,20000000,3000000,5000000,15000000];
    const coeffs  = [ 10, 12, 15, 20, 30,40,45,50,55,60,65,70,75,80,85,90,100,105,110,112,115,130,150,170,200];
    let chosen    = null;

    ranges.some((range, index) => {
         if(value < range) { chosen = coeffs[index]; return true; }
         else return false;  
    })
    return chosen
}


const drawMenu = async (continent, year) => {
    const width = 279
    const height = 100

    const svg = d3.select("#vis")
        .append("svg")
        .attr("width", width)
        .attr("height",height)

    const total            = await getData(`${dataURL}pollution/bycontinent/${getCheckedRadioButton('radio-c')}/${getCheckedRadioButton('radio-y')}/total`)
    const numberPollu      = total[0].TotalPollution
    const totalWorld       = await getData(`${dataURL}pollution/top10/${getCheckedRadioButton('radio-y')}/total`)
    const numberPolluWorld = totalWorld[0].TotalPollution
    const affichervaleur   = (getCheckedRadioButton('radio-c') != 'Top') ? numberPollu : numberPolluWorld
    
    const pollu = svg
        .append('g')
        .attr('id','wp')
       
    pollu.append('rect')
        .attr("width", "150")
        .attr("height", "30")
        .attr("x", "30")
        .attr("y",'40')
        .attr("fill", "white")
        .attr("stroke", "grey")
        .attr("stroke-width","2")
        
    pollu.append('text')
        .text("Total " + (getCheckedRadioButton('radio-c')))
        .attr("x","30")
        .attr("y",'30')
        .style("font-weight", "bold")
        
    pollu.append('text')
        .text(new Intl.NumberFormat({ style: 'decimal'}).format(affichervaleur))
        .attr("x","60")
        .attr("y",'62')
        .style("font-weight", "bold")
}


const drawTimeLine = async (continent,year) => {
    const width = 279
    const height = 120
    const margin = {right :10, left : 10},
        rangeMax = width - margin.left - margin.right;

    const formatDateIntoYear = d3.timeFormat("%Y");
    const startDate = new Date("1975"),
          endDate =  new Date("2014");
    const targetValue = rangeMax;

    const moving = false;

    const svg = d3.select("#timeLine")
        .append("svg")
        .attr("width", width)
        .attr("height",height)
        
    const playButton = d3.select("#play-button")

    /************DESSIN DU SLIDER  ***************/

    const x = d3.scaleTime()
        .domain([startDate,endDate])
        .range([0,rangeMax])
        .clamp(true);
    
    const slider = svg.append("g")
        .attr("class","slider")
        .attr("transform", "translate(" + margin.left + "," + height/2 + ")");

    slider.append("line")
        .attr("class","track")
        .attr("x1", x.range()[0])
        .attr("x2",x.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", () => { return slider.interrupt(); })
            .on("start drag", () => { return update(x.invert(d3.event.x));}))
        
    slider.insert("g",".track-overlay")
        .attr("class","ticks")
        .attr("transform","translate(0," + 50 + ")")
        .selectAll("text")
        .data(x.ticks(4))
        .enter()
        .append("text")
        .attr("x",x)
        .attr("y",-30)
        .attr("font-size","75%")
        .attr("text-anchor","middle")
        .text( (d) => {return formatDateIntoYear(d);});
        
    const handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);
    
    const label = slider.append("text")
        .attr("class","label")
        .attr("text-anchor","middle")
        .text(formatDateIntoYear(startDate))
        .attr("transform", "translate(10," + (-25) + ")")
    


    /************  FONCTION DU SLIDER  ***************/

    playButton
        .on("click", () => {
            const button = d3.select(this);
            if(button.text() == "Pause"){
                moving = false;
                clearInterval(timer);
                button.text("Play");
            }else{
                moving = true;
                timer = setInterval(step,100);
                button.text("Pause");
            }
            timer = setInterval(step,100);
        })

    /*function step (){
        const currentValue = update(x.invert(d3.event.x));
        if (currentValue > (width/150)){
            currentValue = 0;
            clearInterval(timer);
            playButton.text("Play;")
        }        
    }*/

    function update(h){
        handle.attr("cx", x(h));
        label
            .attr("x", x(h))
            .text(formatDateIntoYear(h));
        const years = formatDateIntoYear(h);
    }    
}


const drawChart = async (continent, year) => {

    const functionTab = {
        'Top' : () => `${dataURL}pollution/top10/${year}`,
        'World' : () => `${dataURL}pollution/top10/${year}`
    };

    const data = (continent === 'Top' || continent === 'World') 
        ? await getData(functionTab[continent]())
        : await getData(`${dataURL}pollution/bycontinent/${continent}/${year}`);

    const width       = 1200;
    const height      = 900;
      
    const svg = d3.select('#chart')
        .append('svg')
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1200 900")
        .classed("svg-content", true)
        .attr('id', 'svg')
        .append('g')
        .attr('transform','translate(2,2)');

    const forcecollision = 50;
    
    const simulation = d3.forceSimulation()
        .force('x',d3.forceX(width/2).strength(0.05))
        .force('y',d3.forceY(height/2).strength(0.05))
        .force('collide',d3.forceCollide(computeCicleRadius))
        
    const circles = svg.selectAll('.bdd')
        .data(data)
        .enter()
        .append('g')
        .attr('id', 'cercle')
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '.85')
            
            if (d3.select(this.firstChild).attr('r') <= 40){
                d3.select(this.firstChild).attr('r' ,'100')
                
            }
            d3.select(this.firstChild.nextSibling).attr("opacity","1")
            d3.select(this.firstChild.nextSibling.nextSibling).attr("opacity","1")
            
        })

        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('opacity', '1')
            
            d3.select(this.firstChild).attr('r',computeCicleRadius)
            d3.select(this.firstChild.nextSibling).attr('opacity',d =>{
                if(d.value > 150000) return '1'
                else return '0';})
            d3.select(this.firstChild.nextSibling.nextSibling).attr('opacity',d =>{
                if(d.value > 150000) return '1'
                else return '0';})

            simulation.nodes(data)
                .on('tick', () => circles.attr('transform', d => `translate(${d.x},${d.y})`));
        })
            

    circles.append('circle')
        .attr('class','Pays')
        .attr('r', computeCicleRadius)
        .attr('fill', computeCircleColor) 

    circles.append('text')
        .attr('class','titrePays')
        .attr("dy", ".2em")
        .style("text-anchor", "middle")
        .attr("fill", "black")
        .text(d => d.name)
        .attr('opacity', d =>{
            if(d.value > 150000) return '1'
            else return '0';})
        .style("font-weight", "bold")
    
    circles.append('text')
        .attr("dy", "1.3em")
        .style("text-anchor", "middle")
        .attr("fill", "white")
        .text(d => (new Intl.NumberFormat({ style: 'decimal'}).format(d.value)))
        .attr('opacity', d =>{
            if(d.value > 150000) return '1'; 
            else return '0';})
        .style("font-weight", "bold")

    circles.append('title')
        .text(d => {return d.name;} ) 

    simulation.nodes(data)
        .on('tick', () => circles.attr('transform', d => `translate(${d.x},${d.y})`));


    const legende = svg
        .append('g')
        .attr('id', 'legende')
    
    let x = 220;
    const posx = []
    
    const colors  = ["#2ca02c", "#1f77b4", "#ff7f0e", "#d62728","#8c564b", "#581845"];
    const legendes = ["Pas polluant","Peu polluant","Polluant","Très polluant","Dangereux","Destructeur"]
    
    for( let i = 0; i< 6; i++) {
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
    console.log(getCheckedRadioButton('radio-c'));   
};

// ------------------- INIT FUNCTIONS ------------- //

const init = () => {
    const {continent, year}                    = START_VALUES;
    document.getElementById(continent).checked = true;
    document.getElementById(year).checked      = true;
    drawChart(continent, year);
    drawMenu(continent, year);
    drawTimeLine(continent,year);
};

// --------------------   MAIN   ------------------- //

document.addEventListener('DOMContentLoaded', () => {
    attachHandlers();
    init();
});
