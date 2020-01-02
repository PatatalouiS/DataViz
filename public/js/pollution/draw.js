
// ---------------------  IMPORTS  --------------------- //

import { getTotalFromData, getAllDates, valueToDiscreteTimeline, 
            getCheckedRadioButton, 
            getCurrentYear} from './local_utils.js';
import { showLargeBubble, showInitialBubble, updateTimeLine, playButtonHandler, bubbleTransition} from './handlers.js';

// ----------------------- DRAWING DOM/SVG FUNCTIONS -------------------- //

export const drawTotal = StateApp => {
    const width = 366
    const height = 100
    const total = getTotalFromData(StateApp.getData(), 'value');
    StateApp.setTotal(total);
    const description_1 = "*milliers de tonnes de CO2"
    const description_2 = "*en tonne par habitant"
    var description = description_1;

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
        .text(`Total : Europe`)
        .attr('x','30')
        .attr('y','30')
        .style('font-weight', 'bold')
        
    pollu.append('text')
        .attr('id', 'total-value')
        .text(new Intl.NumberFormat('de-DE').format(total))
        .attr('x','60')
        .attr('y','62')
        .style('font-weight', 'bold')
    
    pollu.append('text')
        .attr('id','description')
        .text(description)
        .attr('x','30')
        .attr('y','90')
        .style('font-style', 'italic')

    d3.select('#total')
    .on('click', () => { 
        console.log("Total") 
        description = description_1;
        svg.select("#description")
        .text(description);
    })

    d3.select('#per-capita')
    .on('click', () => {
        console.log("Per capita") 
        description = description_2;
        svg.select("#description")
        .text(description);
    })

    
    
}

export const drawTimeLine = StateApp => {
    const width              = 366;
    const height             = 120;
    const margin             = {right: 40, left: 40};
    const rangeMax           = width - margin.left - margin.right;
    const dates              = getAllDates();
    const startDate          = dates[0];

    const svg = d3.select('#timeLine')
        .append('svg')
        .attr('id', 'timeline')
        .attr('width', width)
        .attr('height',height)
        
    const playButton = d3.select('#play-button')
        .on('click', () => playButtonHandler(StateApp, playButton, rangeMax));
  
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
            .on('drag', () => updateTimeLine(StateApp, valueToDiscreteTimeline(d3.event.x, rangeMax), rangeMax))
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
        
    slider.insert('circle', '.track-overlay')
        .attr('id', 'handle')
        .attr('class', 'handle')
        .attr('r', 9)
        .attr('cx', 0);
    
    slider.append('text')
        .attr('class','label')
        .attr('id', 'selected-year')
        .attr('text-anchor','middle')
        .attr('year', '1975')
        .text(startDate)
        .attr('transform', 'translate(10,' + (-25) + ')')  
}


export const drawChart = StateApp => {
    const data              = StateApp.getData();
    const { width, height } = StateApp.getChartSpecs();
    const representation    = StateApp.getRepresentation();
    
  
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
            .attr('class', 'bubble-country')

    // Definition of the force Simulation, especially collapse force
    const s = 0.003;
    const force = d3.forceSimulation(data)
        .force('x', d3.forceX(width/2).strength(s))
        .force('y', d3.forceY(height/2).strength(s))
        .force('center', d3.forceCenter(width/2, height/2))
        .force('collide', d3.forceCollide(dataLine => dataLine.finalRadius))
        .on('tick', () => circles.attr('transform', d => `translate(${d.x},${d.y})`));

    StateApp.setForce(force);
     
    circles.append('circle')
        .classed('node', true)
        .attr('class','Pays')
        .attr('r', dataLine => dataLine.radius)
        .attr('fill', dataLine => dataLine.color)
        .attr('opacity' , () => (representation == 'graph') ? '0.7' : '1')
        .on('mouseover', showLargeBubble(StateApp))
        .on('mouseout', showInitialBubble(StateApp))
        .transition()
            .duration(2000)
            .tween('radius', bubbleTransition(StateApp));
        

    circles.append('g')
        .attr('class', 'text-description')
        .attr('id', dataLine => `bubble-text-${dataLine.index}`)
        .style('display', dataLine => dataLine.radius < 50 ? 'none' : '');
        
    const textContainers = d3.selectAll('.text-description');

    textContainers.append('text')
        .attr('class','titrePays p')
        .attr('dy', '.2em')
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .attr('fill','white')
        .style('font-weight', 'bold')
        .style('font-size','20px')
        .text(d => d.name)
        .style('display',() => (representation == 'graph') ? 'none' : '')
        
       
    textContainers.append('text')
        .attr('class', 'valuePays')
        .attr('dy', () => (representation == 'graph') ? '0.8em' :'1.3em')
        .attr('fill', () => (representation == 'graph') ? 'balck' : 'white')
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none')
        .text(d => new Intl.NumberFormat('de-DE').format(d.value))
        .style('font-weight', 'bold')
        .style('font-size','20px')
        

    textContainers.append('title')
        .text(dataLine => dataLine.name)
        .style('pointer-events', 'none'); 

    if(representation === 'graph') drawAxisGraph(StateApp, circles);
};

export const drawAxisGraph = (StateApp, circles) => {
    const { width, height }     = StateApp.getChartSpecs();
    const dataType              = StateApp.getDataType();
    const svg                     = d3.select('#chartgroup');
    const hauteurGraphTotal     = 1000000;
    const hauteurGraphPerCapita = 50;
    var updateYaxis             = 0;
    var data                    = dataType;
    var year                    = getCurrentYear();
    
    
    const xscale = d3.scaleLinear()
    .domain([1970, 2015])
    .range([0, width - 250]);
    //.attr('class','Yaxis');

    const maxValue = (data) => {
    if (data == 'total') {
        updateYaxis = hauteurGraphTotal
        return hauteurGraphTotal}
    else {
        updateYaxis = hauteurGraphPerCapita
        return hauteurGraphPerCapita;
    } }
            

    const yscale = d3.scaleLinear()
    .domain([0,maxValue(dataType)])
    .range([height - 200, 0]);


    const ysccaleres = value => yscale(value) + 110;

    // to interpolate wtf
    const posYear = () => {
        switch(StateApp.getYear()) {
            case 1975 : return 290;
            case 1985 : return 520;
            case 1995 : return 750;
            case 2005 : return 980;
            case 2010 : return 1110;
            case 2012 : return 1130;
            case 2013 : return 1140;
            default : return 1150;
        }
    };

    circles.append('text')
        .attr('class','titrePaysGraphe')
        .attr('dx', ()  => year == '1975' ? '2em' : '-11em')
        .attr('fill', 'black')
        .style('font-weight', 'bold')
        .style('font-size','20px')
        .text(d => d.name.replace(/\(.[^(]*\)/g,''))

    StateApp.getForce()
        .on('tick', () => circles.attr('transform', d => 'translate('+posYear()+','+ysccaleres(d.value)+')'));
    StateApp.getForce().alpha(1).restart();  

    svg.append("g")
        .attr('id',"graph")
    
    svg.append("g")
    .attr("class", "xaxis")
    .attr('transform','translate(170,'+ height/1.1 +')')
    .style('font-weight', 'bold')
    .style('font-size','20px')
    .call(d3.axisBottom(xscale));

    svg.append("g")
    .attr("class", "yaxis")
    .attr('transform','translate(170,110)')
    .style('font-weight', 'bold')
    .style('font-size','20px')
    .call(d3.axisLeft(yscale));

    d3.select('#total')
        .on('click', () => {
            yscale.domain([0,hauteurGraphTotal])
            svg.select(".yaxis")
            .call(d3.axisLeft(yscale))
            data = 'total';
            updateYaxis = hauteurGraphTotal;
        })


    d3.select('#per-capita')
        .on('click', () => {
            yscale.domain([0,hauteurGraphPerCapita])
            svg.select(".yaxis")
            .call(d3.axisLeft(yscale))
            data = 'per-capita';
            updateYaxis = hauteurGraphPerCapita;
        })

    /*---------------------------------- Zoom et dezoom ---------------------------- */
   
    d3.select('#button-moins')
        .on('click', () => {
            if (data == 'total' && updateYaxis < 11000000) updateYaxis = updateYaxis + 100000;
            if (data == 'per-capita' && updateYaxis < 50) updateYaxis = updateYaxis + 10;
            yscale.domain([0,updateYaxis])
            svg.select(".yaxis")
            .transition()
            .duration(750)
            .call(d3.axisLeft(yscale));})

    d3.select('#button-plus')
        .on('click', () =>{
            if (data == 'total' && updateYaxis > 50000) updateYaxis = updateYaxis - 50000;
            if (data == 'per-capita' &&  updateYaxis > 10) updateYaxis = updateYaxis - 10;
            yscale.domain([0,updateYaxis])
            svg.select(".yaxis")
            .transition()
            .duration(750)
            .call(d3.axisLeft(yscale));
        }); 
        
   
    
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

export const drawMenu = async StateApp => {
    const selectTag = document.getElementById('Pays');

    StateApp.getCountries().forEach(({name}) => {
        const newOption = document.createElement('option');
        newOption.innerHTML = name.replace(/\(.[^(]*\)/g,'');
        newOption.classList = 'option-country'
        selectTag.appendChild(newOption);
    });

    $('.selectpicker').selectpicker('refresh');

    document.getElementById('Continent').children[2].selected = true;

    const selectCountry = document.getElementsByClassName('scountry')[1]
    const selectContinent = document.getElementsByClassName('sContinent')[1];
    const radiocheck = getCheckedRadioButton('radio-choice');
}; 

// ------------------------ EXPORTS --------------------------- //

export default {
    drawChart,
    drawLegend,
    drawMenu,
    drawTimeLine,
    drawTotal
};
