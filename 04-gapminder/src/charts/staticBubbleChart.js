import * as d3 from 'd3';
import { getBiggestNumber, roundEndOfScale, getGdp, getLifeExpectancy, getPopulation, swapNulls } from '../data.js';

const year = 2021;
// Importe les données
const gdp = swapNulls(year, getGdp());
const population = swapNulls(year, getPopulation());
const lifeExpectancy = swapNulls(year, getLifeExpectancy());

d3.select('body')
    .append('div')
    .attr('class', 'bubble-chart fullscreen');

// Défini la hauteur, largeur et les marge du graphe.
const margin = { top: 10, right: 50, bottom: 50, left: 50 },
    width = parseInt(d3.select('.bubble-chart').style('width'), 10) - margin.left - margin.right,
    height = parseInt(d3.select('.bubble-chart').style('height'), 10) - margin.top - margin.bottom;

// Met le svg dans le body
const svg = d3.select('.bubble-chart')
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Défini le plus grand PIB pour ajuster l'échelle X et arrondi
const biggestGdp = getBiggestNumber(year, gdp);
const endOfScaleX = roundEndOfScale(biggestGdp, 10000);

// Ajoute l'axe X
const x = d3.scaleSqrt()
    .domain([0, endOfScaleX])
    .range([0, width])

svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickSize(-height).tickFormat(d3.format('~s')))
    .attr('text', 'PIB par habitant')

// Défini la plus grande espérence de vie pour ajuster l'échelle Y et arrondi
const biggestLifeExp = getBiggestNumber(year, lifeExpectancy);
const endOfScaleY = roundEndOfScale(biggestLifeExp, 10);

// // Ajoute l'axe Y
const y = d3.scalePow()
    .exponent(1.7)
    .domain([0, endOfScaleY])
    .range([height, 0]);

svg.append("g")
    .call(d3.axisLeft(y).tickSize(-width));

// Trop de style
svg.selectAll('.tick line, .domain')
    .attr('stroke', 'grey')
    .attr('opacity', 0.2);

svg.append('text')
    .attr('text-anchor', 'center')
    .attr('x', width / 2 - margin.left)
    .attr('y', height + margin.top + 30)
    .text('PIB par habitant [CHF]')

svg.append('text')
    .attr('text-anchor', 'center')
    .attr('transform', 'rotate(-90)')
    .attr('y', -margin.left + 20)
    .attr('x', -margin.top - height / 2 - 35)
    .text('Espérance de vie')

// Défini la plus grande population d'un pays
const biggestPop = getBiggestNumber(year, population);

// Ajoute une échelle pour la taille des bulles
const z = d3.scaleSqrt()
    .domain([0, biggestPop])
    .range([4, 30]);

// Add dots
svg.append('g')
    .selectAll('dot')
    .data(gdp)
    .join('circle')
    .attr('cx', d => x(d[year]));

svg.selectAll('circle')
    .data(lifeExpectancy)
    .join()
    .attr('cy', d => y(d[year]));

svg.selectAll('circle')
    .data(population)
    .join()
    .attr('r', d => z(d[year]))
    .style('fill', '#3EC300')
    .style('opacity', '0.4')
    .style('stroke', 'white');
