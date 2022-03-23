import { json } from 'd3-fetch';
import * as d3 from 'd3';

Promise.all([

    json('https://jsonplaceholder.typicode.com/posts'),
    json('https://jsonplaceholder.typicode.com/users')

])

    .then(([posts, users]) => {

        // Filtre et regroupe les données qu'on souhaite utiliser
        const usersAndPosts = [];

        users.forEach(user => {

            const usersPosts = posts.filter(post => user.id === post.userId).map(post => post.title);

            usersAndPosts.push({
                'nom_utilisateur': user.name,
                'ville': user['address'].city,
                'nom_companie': user['company'].name,
                'titres_posts': usersPosts,
                'nb_posts' : usersPosts.length
            });
        });


        //Affiche le nombre de posts par user 
        const divWriteInDOM = d3.select('body').append('div')

        divWriteInDOM.append('h2').text('Nombre de posts par utilisateur')

        divWriteInDOM.selectAll('p')
            .data(usersAndPosts)
            .enter()
            .append('p')
            .text(d => `${d.nom_utilisateur} : ${d.nb_posts}`)


        //Affiche le user qui a écrit le post le plus long.
        let longestPost = ''
        let longestPostUserId = 0
        posts.forEach(post => {
            if (longestPost.length < post.body.length) {
                longestPost = post.body
                longestPostUserId = post.userId
            }
        })

        const userWithLongestPost = users[longestPostUserId -1].name

        divWriteInDOM.append('h2').text('Utilisateur qui a écrit le post le plus long');
        divWriteInDOM.append('p').text(userWithLongestPost);


        // dessine le graphe
        const margin = { top: 30, right: 30, bottom: 100, left: 60 },
            width = 460 - margin.left - margin.right,
            height = 350 - margin.top - margin.bottom;
        
        const divGraph = d3.select('body').append('div');

        divGraph.append('h2').text('Graphique : nombre de posts par utilisateur')

        const svg = divGraph.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .range([0, width])
            .domain(usersAndPosts.map(d => d.nom_utilisateur))
            .padding(0.2);
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        const y = d3.scaleLinear()
            .domain([0, d3.max(usersAndPosts, d => d.nb_posts)])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        svg.selectAll("mybar")
            .data(usersAndPosts)
            .join("rect")
            .attr("x", d => x(d.nom_utilisateur))
            .attr("y", d => y(d.nb_posts))
            .attr("width", x.bandwidth())
            .attr("height", d => height - y(d.nb_posts))
            .attr("fill", "#69b3a2");

    })

    .catch(error => {
        console.log(error);
    });