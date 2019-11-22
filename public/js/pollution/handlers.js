
// ---------------------  IMPORTS  --------------------- //

import {getCheckedRadioButton, getSelectedOption, getSelectedData, getTotalFromData, getCurrentYear, valueToDateTimeline, getAllDates} from './local_utils.js';
import { drawChart} from './draw.js';
import { Timer } from '../utils.js';

// ---------------------------  MAIN HANDLER ------------------------- //

export const paramsChangedHandler = async () => {
    const svg         = document.getElementById('svg');
    const year        = getCurrentYear();
    const choosenData = getCheckedRadioButton('radio-t');
    const continent   = getSelectedOption('selectOption');    
    
    if(svg) d3.select('#chartgroup').remove();

    const data = await getSelectedData(continent, year, choosenData)
    console.log(data);
    drawChart(data);

    d3.select('#total-title')
        .text(`Total : ${getSelectedOption('selectOption')}`);

    d3.select('#total-value')
        .text(new Intl.NumberFormat('de-DE').format(getTotalFromData(data, 'value')));
}

// ----------------------------  UPDATE CIRCLE RADIUS HANDLERS -------------------- //

export const updateRadius = ({newRadius, simulation, data, transitionDuration, indexTrigger, nodes}) => { 
    const circleTriggered = d3.select(nodes[indexTrigger]);
    const dataTrigger = data[indexTrigger];
    const initX = dataTrigger.x;
    const initY = dataTrigger.y;

    circleTriggered
        .transition()
        .duration(transitionDuration)
        .tween('finalRadius', dataLine => {
            const interpolation = d3.interpolate(dataLine.finalRadius, newRadius);
            circleTriggered.attr('x', initX);
            circleTriggered.attr('y', initY);
            return time => {
                dataLine.finalRadius = interpolation(time)
                circleTriggered.attr('r', dataLine.finalRadius);
                simulation.nodes(data);
            }
        })
    simulation.alpha(1).restart();
    return Promise.resolve();
};

export const showLargeBubble = (simulation, data, timer) => (dataTrigger, indexTrigger, nodes) => {
    dataTrigger.fx = dataTrigger.x;
    dataTrigger.fy = dataTrigger.y;

    if(dataTrigger.finalRadius < 40) {
        timer.setTimeout(() => {
            dataTrigger.previousRadius = dataTrigger.finalRadius;
            updateRadius({
                newRadius : 75,
                simulation,
                data,
                transitionDuration : 400,
                indexTrigger,
                nodes
            })
            .then(() => d3.select(`#bubble-text-${indexTrigger}`).style('display', ''));
        }, 100);
    } 

    d3.select(nodes[indexTrigger].parentNode)
        .transition()
        .duration(50)
        .attr('opacity', '.85')
};

export const showInitialBubble = (simulation, data, timer) => (dataTrigger, indexTrigger, nodes) => {
    dataTrigger.fx = null;
    dataTrigger.fy = null;
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
        d3.select(`#bubble-text-${indexTrigger}`).style('display', 'none');
    } 

    d3.select(nodes[indexTrigger].parentNode)
        .transition()
        .duration(50)
        .attr('opacity', '1');
};

// ---------------------   TIMELINE HANDLERS ----------------------- //

export const updateTimeLine = (posX, timeout = 200, maxValue = 259) => {
    if(!updateTimeLine.manageEventimer) updateTimeLine.manageEventimer = new Timer();
    const lastValue                                                    = Number(d3.select('#handle').attr('cx'));
    const lastYear                                                     = getCurrentYear();
    const newValue = posX >= maxValue ? maxValue : posX;
    const newYear                                                      = valueToDateTimeline(newValue);

    if(newValue !== lastValue) {
        d3.select('#handle')
            .attr('cx', newValue);
        d3.select('#selected-year')
            .attr('x', newValue);
    }
    if(lastYear !== newYear) {
        d3.select('#selected-year')
            .text(newYear);
        updateTimeLine.manageEventimer.clearTimeout();
        updateTimeLine.manageEventimer.setTimeout(paramsChangedHandler, timeout);
    } 
};

export const playButtonHandler = (button, targetValue) => {
    const handle     = d3.select('#handle');
    const transition = handle.transition();

    if(button.text() === "Pause") {  
        transition.duration(0);
        button.text("Play");
    } 
    else {
        button.text("Pause");

        if(getCurrentYear() === '2014') {
           updateTimeLine(0, 0);
        }

        const currentHandlePosition = handle.attr('cx');
        handle.transition()
            .duration((targetValue - currentHandlePosition) * 40)
            .ease(d3.easeLinear)
            .tween('cx', () => {
                const interpolation = d3.interpolate(handle.attr('cx'), targetValue);
                return time => { 
                    updateTimeLine(interpolation(time));  
                } 
            })
            .on('end', () => button.text('Play'));
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
