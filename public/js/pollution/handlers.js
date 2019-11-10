
// ---------------------  IMPORTS  --------------------- //

import {getCheckedRadioButton, getSelectedData, getTotalFromData} from './local_utils.js';
import { drawChart } from './draw.js';

// ---------------------------  MAIN HANDLER ------------------------- //
//launched when selection data change 

export const paramsChangedHandler = async () => {
    const continent   = getCheckedRadioButton('radio-c');
    const year        = getCheckedRadioButton('radio-y');
    const choosenData = getCheckedRadioButton('radio-t');
    const svg         = document.getElementById('svg');

    if(svg) svg.remove();
    const data = await getSelectedData(continent, year, choosenData)
    drawChart(data);

    d3.select('#total')
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
    timer.clear();
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
}

// ------------------------ EXPORTS --------------------------- //

export default {
    paramsChangedHandler,
    updateRadius,
    showLargeBubble,
    showInitialBubble,
};
