import * as d3 from 'd3'
import './index.css';
import './staticBubbleChart.js';
import './choropleth.js';

// Pour importer les données

import gdp from '../data/income_per_person_gdppercapita_ppp_inflation_adjusted.csv'
import lifeExpectancy from '../data/life_expectancy_years.csv'
import population from '../data/population_total.csv'


d3.select("body")
    .append("div")
    .attr('id', 'graph')

let margin = { top: 10, right: 20, bottom: 30, left: 50 },
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

let svg = d3.select("#graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Générer une taille d'axe X cohérente
let theBiggestGDP = 0;
gdp.forEach(pays => {
    let gdpAnneeCourante = pays['2021'];
    if (typeof gdpAnneeCourante === 'string') {
        gdpAnneeCourante = strToInt(pays['2021']);
    }
    pays['2021'] = gdpAnneeCourante;

    // Générer une taille d'axe X cohérente
    if (pays['2021'] >= theBiggestGDP) {
        theBiggestGDP = pays['2021'];
    }
});

// Add X axis
let x = d3.scaleLinear()
    .domain([0, theBiggestGDP * 1.05])
    .range([0, width]);
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

// Générer une taille d'axe Y cohérente
let theBiggestLifeExp = 0;
let theSmallestLifeExp = 0;
console.log(lifeExpectancy);
lifeExpectancy.forEach(pays => {
    if (pays['2021'] >= theBiggestLifeExp) {
        theBiggestLifeExp = pays['2021'];
    }
    theSmallestLifeExp = theBiggestLifeExp;
    if (pays['2021'] <= theSmallestLifeExp) {
        theSmallestLifeExp = pays['2021'];
    }
    if (pays['2021'] === null && pays['2020'] !== null) {
        pays['2021'] = pays['2020'];
    } else if (pays['2021'] === null && pays['2020'] === null) {
        pays['2021'] = pays['2019'];
    }
})

// Add Y axis
let y = d3.scalePow()
    .exponent(1.5)
    .domain([0, theBiggestLifeExp * 1.1])
    .range([height, 0]);
svg.append("g")
    .call(d3.axisLeft(y));

population.forEach(pays => {
    let popAnneeCourante = pays['2021'];
    if (typeof popAnneeCourante === 'string') {
        popAnneeCourante = strToInt(pays['2021']);
    }
    pays['2021'] = popAnneeCourante;
});

// Add a scale for bubble size
let z = d3.scaleLinear()
    .domain([200000, 1310000000])
    .range([5, 60]);

// Add dots
svg.append('g')
    .selectAll("dot")
    .data(gdp)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return x(d["2021"]); })
    .attr("r", 10)
    .style("fill", `#${Math.floor(Math.random() * 16777215).toString(16)}`)
    .style("opacity", "0.7")
    .attr("stroke", "black")

svg.selectAll("circle").data(lifeExpectancy).join()
    .attr("cy", function (d) { return y(d["2021"]); })

svg.selectAll("circle").data(population).join()
    .attr("r", function (d) { return z(d["2021"]); })

function strToInt(nb) {
    let multi;
    let number
    if (nb.slice(-1) === 'k') {
        multi = 1000;
        // console.log(gdpAnneeCourante + " ; c'est un k");
        number = nb.split('k')[0];
    } else if (nb.slice(-1) === 'M') {
        multi = 1000000;
        // console.log("c'est un M");
        number = nb.split('M')[0];
    } else if (nb.slice(-1) === 'B') {
        multi = 1000000000;
        // console.log("c'est un M");
        number = nb.split('B')[0];
    } else {
        // console.log('ça beug');
    }
    number = parseInt(number * multi);
    return number;
};


