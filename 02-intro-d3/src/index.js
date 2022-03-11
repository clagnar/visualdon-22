import * as d3 from 'd3';

//Changer la couleur du deuxième cercle
const svg = d3.select(".mon-svg");
const cercle_dos = svg.select("#dos");
cercle_dos.attr("fill", "#E92528");

//Déplacez de 50px vers la droite le premier et le deuxième cercle
const cercles_translation = svg.selectAll(".translation");
cercles_translation.attr('transform','translate(50,0)');

//Rajoutez du texte en dessous de chaque cercle
d3.selectAll(".circle")
  .append("g")
  .attr("class", "circleLabel")
  .append("text")
  .text(function(d) {
    return d.label
  })

  //Alignez verticalement les cercles en cliquant sur le dernier cercle
  const cercle_3 = svg.select('#tres');
  let r = 15;
  cercle_3.on("click", () => {
        r = r + 10;
        cercle_3.attr("r", r);
        } )

  