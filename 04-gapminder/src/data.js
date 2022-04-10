// Importe les données
import gdp from '/data/income_per_person_gdppercapita_ppp_inflation_adjusted.csv';
import population from '/data/population_total_better.csv';
import lifeExpectancy from '/data/life_expectancy_years.csv';

// Permet de définir la valeur haute d'une échelle
export function getBiggestNumber(year, data) {
    let biggestNumber = 0;
    data.forEach(country => {
        if (country[year] > biggestNumber) biggestNumber = country[year];
    });
    return biggestNumber;
}

// Arrondi
export function roundEndOfScale(num, scale) {
    return Math.ceil(num / scale) * scale;
}

// Itère les données pour transformer 
function cleanDataNumbers(data) {
    return data.map(country => {
        Object.keys(country).forEach(key => {
            if (typeof country[key] === 'string' && key !== 'country') country[key] = strToInt(country[key]);
        });
        return country;
    })
}

function strToInt(str) {
    let SI = str.slice(-1);

    switch (SI) {
        case 'k': return Number(str.slice(0, -1)) * Math.pow(10, 3);

        case 'M': return Number(str.slice(0, -1)) * Math.pow(10, 6);

        case 'B': return Number(str.slice(0, -1)) * Math.pow(10, 9);
    }
}

export function swapNulls(year, data) {
    data.forEach(country => {
        if (country[year] === null) {
            let prevYear = year;
            do {
                prevYear--;
            } while (country[prevYear] === null);
            country[year] = country[prevYear];
        }
    })
    return data;
}

export function getGdp() {
    return cleanDataNumbers(gdp);
}

export function getPopulation() {
    return cleanDataNumbers(population);
}

export function getLifeExpectancy() {
    return cleanDataNumbers(lifeExpectancy);
}