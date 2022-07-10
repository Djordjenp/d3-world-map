import './style.css'
import * as d3 from "d3";
import * as topojson from "topojson-client";


// The svg
const svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
const path = d3.geoPath();
const projection = d3.geoMercator()
    .center([0,20])
    .translate([width / 2, height / 2]);

// Data and color scale
let data = new Map()
const colorScale = d3.scaleThreshold()
    .domain([5000, 10_000, 50_000, 100_000, 500_000, 1_000_000, 5_000_000])
    .range(['#ffc9c9', '#ffa8a8', '#ff8787', '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a']);

const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[0, 0], [width, height]])
    .on('zoom', zoomed);

svg.call(zoom);

// Load external data and boot
Promise.all([
    d3.json("https://unpkg.com/world-atlas@2.0.2/countries-50m.json"),
    fetch( 'https://disease.sh/v3/covid-19/countries').then(res => res.json()).then(countries => {
        countries.forEach(country => {
            // console.log(country?.countryInfo?.iso3)
            console.log(country?.countryInfo?.["_id"])
            data.set(country?.countryInfo?.["_id"], country?.cases)
        })
    })
    // d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) {
    //     console.log(d)
    //     data.set(d.code, +d.pop)
    // })
]).then(function(loadData){
    let topo = loadData[0]
    const geoJsonData = topojson.feature(topo,topo.objects.countries)
    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(geoJsonData.features)
        .join("path")
        // draw each country
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style('stroke', 'white')
        .style('stroke-width', 0.1)
        // set the color of each country
        .attr("fill", function (d) {
            console.log(d.id)
            d.total = data.get(+d.id) || 0;
            return colorScale(d.total);
        })
        .on("mouseover", function (d, i) {

        })

})

function zoomed(event) {
    svg.selectAll('g')
        .selectAll('path')// To prevent stroke width from scaling
        .attr('transform', event.transform);
}
