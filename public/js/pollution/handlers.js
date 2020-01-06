
'use strict';

// ------------------------ IMPORTS ---------------------------------------------- //
import {    getCheckedRadioButton, getSelectedOption, getSelectedData, getMaxfromData,
            getTotalFromData, getCurrentYear, valueToDateTimeline, updateData, computeCircleRadius, computePlaceText } from './local_utils.js';
import Timer from './timer.js';
import { drawChart } from './draw.js';

// ------------------------ MAIN HANDLERS ------------------------- //
export const paramsChangedHandler = StateApp => async () => { 
    const year            = getCurrentYear();
    const dataType        = getCheckedRadioButton('radio-t');
    const placeType       = getCheckedRadioButton('radio-choice');
    const place           = placeType === 'byContinent'
        ? getSelectedOption('selectContinent') 
        : getSelectedOption('selectCountry');

    StateApp.setPlace(place);
    StateApp.setYear(year);
    StateApp.setDataType(dataType);
    StateApp.setPlaceType(placeType);

    const lastData = Array.from(StateApp.getData());
    const newData = await getSelectedData(StateApp);
    
    StateApp.setTotal(getTotalFromData(newData));
   
    updateData(StateApp, lastData, newData);    
    updateChart(StateApp);
    updateTotal(StateApp);  
};

export const switchRepresentation = StateApp => () => {
    d3.select('#chartgroup').remove();
    const representation = getCheckedRadioButton('radio-rp');
    StateApp.setRepresentation(representation);
    const maxValue = getMaxfromData(StateApp.getData(), 'value');
    StateApp.getData().forEach(dataLine => {
        dataLine.finalRadius = computeCircleRadius(dataLine, maxValue, representation);
        if(representation === 'bubble') {
            dataLine.radius = 0;
            dataLine.lastRadius = 0;
        } 
    });
    drawChart(StateApp);
};

// ----------------------- UPDATE CIRCLE RADIUS HANDLERS -------------------- //
export const updateRadius = ({ newRadius, simulation, data, transitionDuration, indexTrigger, nodes }) => { 
    const circleTriggered = d3.select(nodes[indexTrigger]);
    const dataTrigger = data[indexTrigger];
    const initX = dataTrigger.x;
    const initY = dataTrigger.y;

    circleTriggered
        .transition()
        .duration(transitionDuration)
        .tween('radius', dataLine => {
            const interpolation = d3.interpolate(dataLine.radius, newRadius);
            circleTriggered.attr('x', initX);
            circleTriggered.attr('y', initY);
            return time => {
                dataLine.radius = interpolation(time)
                circleTriggered.attr('r', dataLine.radius);
                simulation.nodes(data);
            }
        })
    simulation.alpha(1).restart();
    return Promise.resolve();
};

export const showLargeBubble = StateApp => (dataTrigger, indexTrigger, nodes) => {
    StateApp.getForce().force('collide', d3.forceCollide(dataLine => dataLine.radius));
    dataTrigger.fx = dataTrigger.x;
    dataTrigger.fy = dataTrigger.y;
    const button = getCheckedRadioButton('radio-rp') =='graph';

    if(dataTrigger.radius < (button ? 60 : 40)) {
        StateApp.getTimer().setTimeout(() => {
            dataTrigger.previousRadius = dataTrigger.radius;
            updateRadius({
                newRadius : 75,
                simulation : StateApp.getForce(),
                data : StateApp.getData(),
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
        .attr('opacity', '0.8')
};

export const showInitialBubble = StateApp => (dataTrigger, indexTrigger, nodes) => {
    dataTrigger.fx = null;
    dataTrigger.fy = null;
    StateApp.getTimer().clearTimeout();
    StateApp.getForce().force('collide', d3.forceCollide(dataLine => dataLine.radius))

    if(dataTrigger.hasOwnProperty('previousRadius')) {
        updateRadius({
            newRadius : dataTrigger.previousRadius,
            simulation : StateApp.getForce(),
            data : StateApp.getData(),
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
        .attr('opacity', '1')
};

// ----------------------- TIMELINE HANDLERS ------------------------------------- //
export const updateTimeLine = (StateApp, posX, maxValue, timeout = 200) => {
    if(!updateTimeLine.manageEventimer) updateTimeLine.manageEventimer = new Timer();
    const lastValue                                                    = Number(d3.select('#handle').attr('cx'));
    const lastYear                                                     = getCurrentYear();
    const newValue                                                     = posX >= maxValue ? maxValue : posX;
    const newYear                                                      = valueToDateTimeline(newValue, maxValue);
   
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
        updateTimeLine.manageEventimer.setTimeout(paramsChangedHandler(StateApp), timeout);
    } 
};

export const playButtonHandler = (StateApp, button, targetValue) => {
    const handle      = d3.select('#handle');
    const transition  = handle.transition();

    if(button.text() === "Pause") {  
        transition.duration(0);
        button.text("Play");
    } 
    else {
        button.text("Pause");
        if(StateApp.getYear() === 2014) updateTimeLine(StateApp, 0, undefined, 200);
        const currentHandlePosition = Number(handle.attr('cx'));

        handle.transition()
            .duration((targetValue - currentHandlePosition) * 55)
            .ease(d3.easeLinear)
            .tween('cx', () => {
                const interpolation = d3.interpolate(currentHandlePosition, targetValue);
                return time => updateTimeLine(StateApp, interpolation(time), targetValue);  
            })
            .on('end', () => button.text('Play'));
    }
}

// ----------------------- ANIMATION OF TRANSITION ------------------------------- //
export const bubbleTransition = StateApp => (dataLine, index , nodes) => {
    const circle              = d3.select(nodes[index]);
    const textOfcircle        = d3.select(nodes[index].parentNode.children[1]);
    const valueCircle         = d3.select(nodes[index].parentNode.children[1].children[1]);
    const interpolationRadius = d3.interpolate(dataLine.lastRadius, dataLine.finalRadius);
    const interpolationColor  = d3.interpolateHcl(dataLine.lastColor, dataLine.finalColor);
    const interpolationValue  = d3.interpolate(dataLine.lastValue, dataLine.value);

    return time => {
        dataLine.radius = interpolationRadius(time);
        circle.attr('r', dataLine.radius);
        
        dataLine.color = interpolationColor(time);
        circle.attr('fill', dataLine.color);

        dataLine.showedValue = StateApp.getDataType() === 'total'
            ? Math.floor(interpolationValue(time))
            : interpolationValue(time);

        valueCircle.text(d => new Intl.NumberFormat('de-DE', {maximumFractionDigits: 1}).format(d.showedValue))
        textOfcircle.style('display', dataLine.radius >= 40 ? '' : 'none');            

        StateApp.getForce().nodes(StateApp.getData());
    };
};

// ------------------------ UPDATE AFTER DATA CHANGED FUNCTIONS  ----------------- //
export const updateChart = StateApp => {
    const titrePaysGraphe = d3.selectAll('.titrePaysGraphe');
    const representation  = StateApp.getRepresentation();
    const year            = StateApp.getYear();

    d3.selectAll('.Pays')
        .transition()
        .duration(2000)
        .tween('radius-value-color', bubbleTransition(StateApp))
    
    if(representation === 'graph') {
        titrePaysGraphe.style('display', dataLine => dataLine.radius > 0 ? '' : 'none');
        (year > 2005) 
            ? titrePaysGraphe.attr('dx','-12em')
            : titrePaysGraphe.attr('dx','2em');
    }

    StateApp.getForce().alpha(1).restart();
    StateApp.getForce().force('collide', d3.forceCollide(dataLine => dataLine.radius));        
};

export const updateTotal = StateApp => {
    const totalDiv  = d3.select('#total-value');
    const lastTotal = Number(d3.select('#total-value').text().replace(/\./g, ''));
    const newTotal  = StateApp.getTotal();
    const newPlaceText = computePlaceText(StateApp);

    d3.select('#total-title')
        .text(`Total : ${newPlaceText}`);

    totalDiv.transition()
        .duration(2000)
        .tween('total', () => {
            const interpolation = d3.interpolate(lastTotal, newTotal);
            return time => totalDiv.text(new Intl.NumberFormat('de-DE').format(Math.floor(interpolation(time))));
        });
};

export default {
    paramsChangedHandler,
    updateRadius,
    showLargeBubble,
    showInitialBubble,
    updateTimeLine,
    playButtonHandler,
    bubbleTransition,
    updateChart
};
