import * as d3 from 'd3';
import { getLifeExpectancy, swapNulls } from './data.js';

const year = 2021;
// Importe les données
const lifeExpectancy = swapNulls(year, getLifeExpectancy());

d3.select('body')
    .append('div')
    .attr('class', 'choropleth fullscreen');

// Défini la hauteur, largeur et les marge du graphe.
const margin = { top: 30, right: 0, bottom: 0, left: 0 },
    width = parseInt(d3.select('.choropleth').style('width'), 10) - margin.left - margin.right,
    height = parseInt(d3.select('.choropleth').style('height'), 10) - margin.top - margin.bottom;

// Met le svg dans le body
const svg = d3.select('.choropleth')
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Map and projection
const path = d3.geoPath();
const projection = d3.geoMercator()
    .scale(100)
    .center([0, 20])
    .translate([width / 2, height / 2]);

// Data and color scale
const colors = d3.scaleQuantize()
    .domain([50,90])
    .range(d3.schemeReds[5])

// Load external data and boot
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(mapData => {

    let mouseOver = function (d) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .2)
        d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", 1)
    }

    let mouseLeave = function (d) {
        d3.selectAll(".Country")
            .transition()
            .duration(200)
            .style("opacity", .8)
        d3.select(this)
            .transition()
            .duration(200)
    }

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(mapData.features)
        .enter()
        .append("path")
        .attr('class', 'choropleth-group')
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "white")
        .attr("class", d => { return "Country" })
        .style("opacity", .8)
        .on("mouseover", mouseOver)
        .on("mouseleave", mouseLeave)


    // set the color of each country
    svg.selectAll('.Country')
        .data(lifeExpectancy)
        .join()
        .attr("fill", d => colors(d[2021]));

    svg.append('text')
        .attr('text-anchor', 'center')
        .attr('x', width / 2)
        .attr('y', margin.top)
        .text('Espérance de vie')

})