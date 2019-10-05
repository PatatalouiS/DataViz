
'use strict';




const deletePropertiesByName = (data, properties) => data
	.map(el =>
	{
		let obj = {}
		properties.forEach(property =>
		{
			delete el[property];
			obj = el
		});
		return obj;
	});


const filter = data =>
{
	const filteredData = data
		.filter(lineOBJ => lineOBJ.Series.indexOf("capita") === -1)
		//.filter(lineOBJ => lineOBJ.Year === 2005)
		//.sort((lineOBJ1, lineOBJ2) => lineOBJ1.Value > lineOBJ2.Value)
		//.slice(1, 11);

	return deletePropertiesByName(filteredData, ["Footnotes", "Series", "Source", "Area"]);
} 
	

const drawChart = data =>
{
	const top    = 20;
	const right  = 20;
	const bottom = 50;
	const left   = 120;
	const width  = 800 - left - right;
	const height = 400 - top - bottom;
	const x      = d3.scaleBand().range([0, width]).padding(0.25);
	const y      = d3.scaleLinear().range([height, 0]);

	const svg = d3.select("#chart")
		.append("svg")
	    .attr("id", "svg")
	    .attr("width", width + left + right)
	    .attr("height", height + top + bottom)
	    .append("g")
	    .attr("transform", "translate(" + left + "," + top + ")");

	const div = d3.select("body")
		.append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

	x.domain(data.map(line => line.year));
	y.domain([0, d3.max(data, line => line.value)]);

	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x).tickSize(0))
		.selectAll("text")	
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

    svg.append("g")
    	.call(d3.axisLeft(y).ticks(6));

    svg.selectAll(".bar")
        .data(data)
    	.enter()
	    	.append("rect")
	        .attr("class", "bar")
	        .attr("x", line => x(line.year))
	        .attr("width", x.bandwidth())
	        .attr("y", line => y(line.value))
	        .attr("height", line => height - y(line.value))	
	        .attr("fill", "#6b8fe5")
	        .style("stroke", "black")	
	        .style("stroke-width", 2 )	
	        .style("stroke-linecap", "round")	
        	.on("mouseover", tooltipMouseOver(div))
        	.on("mouseout", tooltipMouseOut(div));

	return data;
};


const tooltipMouseOver = div => line =>
{
	div.transition()       
        .duration(200)      
        .style("opacity", 0.9);

    div.html("Pollution en mégatonnes : " + line.value)
        .style("left", (d3.event.pageX + 10) + "px")     
        .style("top", (d3.event.pageY - 50) + "px");
}


const tooltipMouseOut = div => line =>
{
	div.transition()
		.duration(500)
		.style("opacity", 0);
}


const init = async () =>
{
	document.getElementById('select').selectedIndex = 0;
	const data = await getData(`${dataURL}Afghanistan`);
	drawChart(data);
}


const tests = async variable =>
{
	console.log('DOM Chargé');
	console.log(`HOST is ${HOST}`);
	const URL_Static_JSON = 'http://localhost:8080/static/json/PIB_citizen.json'

	const data = await getData(dataURL);

	return variable;
};


// -------------   Handlers   -------------- //


const handlerSelected = selectTag => async () =>
{
	d3.select('svg').transition().duration(2000).style("opacity", 0);
	const oldChart = document.getElementById('svg');
	if(oldChart) oldChart.remove(); 
	const data = await getData(dataURL + selectTag.value);
	drawChart(data);
};


const attachAllHandlers = () =>
{
	const selectTag = document.getElementById('select');
	selectTag.addEventListener('change', handlerSelected(selectTag));
}


// ----------   Main Program   ------------ //


document.addEventListener("DOMContentLoaded", () =>
{
	init();
	attachAllHandlers();
	tests();

}, false);


















