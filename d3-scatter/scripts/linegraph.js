// -- DEFINE CONSTANTS --

// radius of dots in pixels.
  var radius = 10;

// color palette of dots
  var colorPalette = d3.interpolateSpectral;


// -- INITIALIZE VARIABLES --
// set dimensions of viz. w/ margins
  var margin = {top: 60, right: 75, bottom: 0, left: 250},
    width = 1000 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

  var body = d3.select("body");

  var vis = d3.select("#vis");

// define scales (# pixels for each axis)
  var x = d3.scaleLinear()
    .range([0, width]);

    var y = d3.scaleLinear()
      .range([height, 0]);

  var z = d3.scaleSequential(colorPalette);
  var   zCat = d3.scaleOrdinal(d3.schemeCategory20b);

// define look of axis
  var xAxis = d3.axisBottom()
    .scale(x)
    .ticks(5);

  var yAxis = d3.axisLeft()
    .scale(y);

// gridlines in x axis function
  function make_x_gridlines() {
    return d3.axisBottom(x)
    .ticks(5)
  }

// -- TRANSITIONS --
  var t1_change = d3.transition()
    .duration(4000)

// front-matter text
  body.append("h2")
      .text("random text");



  body.append("div")
      .attr("class", "clearfix")

  // BUTTONS
  wealth = vis.select("#Wealth");



// -- DATA --
// import data as csv.
  d3.csv("data/tfr.csv", function(error, data){
    if(error) throw error;

console.log(data)
  // sort the average values, descendingly.
data = data.filter(function(d) {return d.country == "Rwanda"});
    // console.log(data)

    var cities = data.map(function(id) {
      return {
        id: id,
        values: data.map(function(d) {
          return {year: d.year, tfr: d[id]};
        })
      };
    });

    lz = data.filter(function(d) {return d.Variable;});

       var nested = d3.nest()
       .key(function(d) { return d.Category })
      //  .key(function(d) { return d.year; })
          // .sortKeys(d3.ascending)
          .entries(data);
          // console.log(nested)

// NAVBAR ----------------------------------------------------------------------
          // Clicky buttons at top.
          // create the nav bar
  var nav = vis.append("ul")
    .attr("id", "select-cat")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    nav.selectAll("ul")
      .style("width", "20px")
      .data(nested)
    .enter().append("li").append("a")
      .attr("id", "cats")
      .attr("class", function(d) {return "button " + d.key;})
      .attr("x", function(d, i) {return i*150 + 10;})
      .attr("y",100)
      .text(function(d) {return d.key;});
// -----------------------------------------------------------------------------


// DOMAINS -------------------------------------------------------------------------
// set the domain (data range) of data
  x.domain([d3.min(data, function(element) { return element.year; }), d3.max(data, function(element) { return element.year; })]);
  y.domain([0, d3.max(data, function(element) { return element.tfr; })]);
  // z.domain([d3.max(data, function(element) { return element.avg; }), 0]);
  z.domain([-0, 8]);




// -----------------------------------------------------------------------------


// create the SVG object
  var svg = vis.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// // x-axis label
//     svg.append("text")
//         .attr("class", "top-label")
//         .attr("x", 0)
//         .attr("y", -30)
//         .text("percent of married women using modern contraception");

var line = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.tfr); });

    // add connector lines
      svg.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5)
          .attr("d", line)
          .style("stroke", function(d) { return zCat(d.id); });;

// FILTER THE DATA
// Outer g for dots.
    var g = svg.selectAll("g")
        .data(data)
      .enter().append("g");

      svg.selectAll("circle")
          .data(data.filter(function(d) {return d.country == "Rwanda"}))
      .enter().append("circle")
          .attr("class", "dot")
          .attr("r", radius)
          .attr("cx", function(d) {console.log(arguments);return x(+d.year);})
          .attr("cy", function(d) {return y(+d.tfr);})
          .attr("fill", function(d) {return z(+d.tfr);});




// create dots.

// for 2014 data (copy of 2010 that gets changed)
  var dotGroup2014 = svg.append("g")
    .attr("class", "dot");


  // dotGroup2014.selectAll("dot")
  //   .data(data)
  // .enter().append("circle")
  //   .attr("cx", function(d) {return x(d.ave)})
  //   .attr("cy", function(d) {return y(d.Variable)+y.bandwidth()/2})
  //   .attr("r", radius)
  //   .style("fill", function(d) {return z(d.ave)})
  //   .style("fill-opacity", 1)
  //  .transition()
  //   // .delay(function(d,i) {return i*100;})
  //   .duration(4000)
  //   .attr("cx", function(d) {return x(d.ave)})
  //   .style("fill", function(d) {return z(d.ave)});


// draw the axes
  svg.append("g")
    .call(xAxis)
    .attr("class", "x axis")
    .attr("transform", "translate(0," + -margin.top/2 + ")");

  svg.append("g")
    .call(yAxis)
    .attr("class","y axis")


     });
