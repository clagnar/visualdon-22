import * as d3 from 'd3';
import { getBiggestNumber, roundEndOfScale, getGdp, getLifeExpectancy, getPopulation } from '/src/data.js';

// Importe les données
const gdp = getGdp();
const population = getPopulation();
const lifeExpectancy = getLifeExpectancy();

// Récupère toutes les années
const annees = Object.keys(population[0])

let pop = [],
    income = [],
    life = [],
    dataCombined = [];

// Merge data
const mergeByCountry = (a1, a2, a3) => {
    let data = [];
    a1.map(itm => {
        let newObject = {
            ...a2.find((item) => (item.country === itm.country) && item),
            ...a3.find((item) => (item.country === itm.country) && item),
            ...itm
        }
        data.push(newObject);
    })
    return data;
}

annees.forEach(annee => {
    pop.push({ "annee": annee, "data": converterSI(population, annee, "pop") })
    income.push({ "annee": annee, "data": converterSI(gdp, annee, "income") })
    life.push({ "annee": annee, "data": converterSI(lifeExpectancy, annee, "life") })
    const popAnnee = pop.filter(d => d.annee == annee).map(d => d.data)[0];
    const incomeAnnee = income.filter(d => d.annee == annee).map(d => d.data)[0];
    const lifeAnnee = life.filter(d => d.annee == annee).map(d => d.data)[0];
    dataCombined.push({ "annee": annee, "data": mergeByCountry(popAnnee, incomeAnnee, lifeAnnee) })
});

function converterSI(array, variable, variableName) {
    let convertedVariable = array.map(d => {
        // Trouver le format SI (M, B, k)
        let SI = typeof d[variable.toString()] === 'string' || d[variable.toString()] instanceof String ? d[variable.toString()].slice(-1) : d[variable.toString()];
        // Extraire la partie numérique
        let number = typeof d[variable.toString()] === 'string' || d[variable.toString()] instanceof String ? parseFloat(d[variable.toString()].slice(0, -1)) : d[variable.toString()];
        // Selon la valeur SI, multiplier par la puissance
        switch (SI) {
            case 'M': {
                return { "country": d.country, [variableName]: Math.pow(10, 6) * number };
                break;
            }
            case 'B': {
                return { "country": d.country, [variableName]: Math.pow(10, 9) * number };
                break;
            }
            case 'k': {
                return { "country": d.country, [variableName]: Math.pow(10, 3) * number };
                break;
            }
            default: {
                return { "country": d.country, [variableName]: number };
                break;
            }
        }
    })
    return convertedVariable;
};

// défini les valeurs les plus grandes
let biggestGdp = 0;
let biggestLifeExp = 0;
let biggestPop = 0;

for (let year = 1800; year <= 2050; year++) {
    if (getBiggestNumber(year, gdp) > biggestGdp) biggestGdp = getBiggestNumber(year, gdp);
    if (getBiggestNumber(year, lifeExpectancy) > biggestLifeExp) biggestLifeExp = getBiggestNumber(year, lifeExpectancy);
    if (getBiggestNumber(year, population) > biggestPop) biggestPop = getBiggestNumber(year, population);
}

const nav = d3.select('body')
    .append('nav');

nav.append('button')
    .attr('id', 'play')
    .text('PLAY');

nav.append('button')
    .attr('id', 'stop')
    .text('STOP');

nav.append('p')
    .attr('class', 'year');

// Ajoute la div qui contiendra le graphe
const chartContainer = d3.select('body')
    .append('div')
    .attr('class', 'bubble-chart fullscreen animated');

// Défini la hauteur, largeur et les marge du graphe
const margin = { top: 10, right: 50, bottom: 50, left: 50 },
    width = parseInt(d3.select('.animated').style('width'), 10) - margin.left - margin.right,
    height = parseInt(d3.select('.animated').style('height'), 10) - margin.top - margin.bottom;

// Met le svg dans le body
const svg = d3.select('.animated')
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Défini le plus grand PIB pour ajuster l'échelle X et arrondi
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

// Ajoute une échelle pour la taille des bulles
const z = d3.scaleSqrt()
    .domain([0, biggestPop])
    .range([4, 30]);

// Variable où on stocke l'id de notre intervalle
let nIntervId;

function animate() {
    // regarder si l'intervalle a été déjà démarré
    if (!nIntervId) {
        nIntervId = setInterval(play, 200);
    }
}
console.log(dataCombined)
let i = 0;
function play() {
    // Recommencer si à la fin du tableau
    if (i >= 250) {
        i = 0;
    } else {
        i++;
    }

    // Mise à jour graphique
    d3.select('.year').text(dataCombined[i].annee);

    updateChart(dataCombined[i]);
}

// Mettre en pause
function stop() {
    clearInterval(nIntervId);
    nIntervId = null;
}

// Fonctions de mise à jour du graphique
function updateChart(data) {

    let t = d3.transition().duration(500).ease(d3.easeLinear);

    svg.selectAll('circle')
        .data(data.data)
        .join(enter => enter
                .append('circle')
                .style('fill', '#3EC300')
                .style('opacity', '0.4')
                .style('stroke', 'white')
                .attr('cx', d => x(d.income))
                .attr('cy', d => y(d.life))
                .attr('r', d => z(d.pop))
                .transition(t),
            update => update
                .transition(t)
                .attr('cx', d => x(d.income))
                .attr('cy', d => y(d.life))
                .attr('r', d => z(d.pop)),
            exit => exit
                .remove()
        );
}

// Event listener
document.getElementById("play").addEventListener("click", animate);
document.getElementById("stop").addEventListener("click", stop);
