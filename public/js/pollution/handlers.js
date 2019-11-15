
// ---------------------  IMPORTS  --------------------- //

import {getCheckedRadioButton, getSelectedData, getTotalFromData, getCurrentYear, valueToDateTimeline, getAllDates} from './local_utils.js';
import { drawChart } from './draw.js';
import { Timer } from '../utils.js';

// ---------------------------  MAIN HANDLER ------------------------- //
//launched when selection data change 

export const paramsChangedHandler = async () => {
    const svg         = document.getElementById('svg');
    if(svg) svg.remove();
    const continent   = getCheckedRadioButton('radio-c');
    const year        = getCurrentYear();
    const choosenData = getCheckedRadioButton('radio-t');

    const data = await getSelectedData(continent, year, choosenData)
    drawChart(data);

    d3.select('#total-title')
        .text(`Total : ${getCheckedRadioButton('radio-c')}`);

    d3.select('#total-value')
        .text(new Intl.NumberFormat('de-DE').format(getTotalFromData(data, 'value')));
};

// ----------------------------  UPDATE CIRCLE RADIUS HANDLERS -------------------- //

export const updateRadius = ({newRadius, simulation, data, transitionDuration, indexTrigger, nodes}) => { 
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
    return Promise.resolve();
};

export const showLargeBubble = (simulation, data, timer) => (dataTrigger, indexTrigger, nodes) => {
    if(dataTrigger.radius < 40) {
        timer.setTimeout(() => {
            dataTrigger.previousRadius = dataTrigger.radius;
            updateRadius({
                newRadius : 75,
                simulation,
                data,
                transitionDuration : 400,
                indexTrigger,
                nodes
            })
            .then(() => {
                d3.select(nodes[indexTrigger].parentNode.firstChild.nextSibling).style('display', '')
                d3.select(nodes[indexTrigger].parentNode.firstChild.nextSibling.nextSibling).style('display', '') 
            });
        }, 0);
    } 

    d3.select(nodes[indexTrigger].parentNode)
        .transition()
        .duration(50)
        .attr('opacity', '.85')
};

export const showInitialBubble = (simulation, data, timer) => (dataTrigger, indexTrigger, nodes) => {
    timer.clearTimeout();
    if(dataTrigger.hasOwnProperty('previousRadius')) {
        updateRadius({
            newRadius : dataTrigger.previousRadius,
            simulation,
            data,
            transitionDuration : 400,
            indexTrigger, 
            nodes
        })

        delete dataTrigger.previousRadius;
        d3.select(nodes[indexTrigger].parentNode.firstChild.nextSibling)
            .style('display', 'none')
        d3.select(nodes[indexTrigger].parentNode.firstChild.nextSibling.nextSibling)
            .style('display', 'none')
    } 

    d3.select(nodes[indexTrigger].parentNode)
        .transition()
        .duration(50)
        .attr('opacity', '1')
};

// ---------------------   VARIOUS HANDLERS ----------------------- //

export const updateTimeLine = (newValue, newDate, timeout = 150) => {
    if(!updateTimeLine.manageEventimer) updateTimeLine.manageEventimer = new Timer();
    const lastValue = Number(d3.select('#handle').attr('cx'));
    const lastYear  = getCurrentYear();

    if(newValue !== lastValue) {
        updateTimeLine.manageEventimer.clearTimeout();
        d3.select('#handle')
            .attr('cx', newValue);
        d3.select('#selected-year')
            .attr('x', newValue)
            .attr('year', newDate)
            .text(newDate);
        updateTimeLine.manageEventimer.setTimeout(paramsChangedHandler, timeout);
    }
};

export const playButtonHandler = (button, targetValue) => {
    if(!playButtonHandler.timer) playButtonHandler.timer = new Timer(); // set static local Timer
    if(button.text() === "Pause") {  
        playButtonHandler.timer.clearInterval();
        button.text("Play");
    } 
    else {
        if(getCurrentYear() === '2014') updateTimeLine(0, valueToDateTimeline(0), 0);
        button.text("Pause");
        playButtonHandler.timer.setInterval(() => {
            const lastValue   = Number(d3.select('#handle').attr('cx'));
            const newValue    = lastValue + (targetValue / 80);
            
            if(newValue >= targetValue) {
                updateTimeLine(targetValue, valueToDateTimeline(targetValue), 0);
                button.text('Play');
                playButtonHandler.timer.clearInterval();
            }
            else updateTimeLine(newValue, valueToDateTimeline(newValue));
        }, 100);
    }
}

// ------------------------ EXPORTS --------------------------- //

export default {
    paramsChangedHandler,
    updateRadius,
    showLargeBubble,
    showInitialBubble,
    updateTimeLine,
    playButtonHandler
};
