// -- DEFINE CONSTANTS --

// radius of dots in pixels.
  var radius = 10;

// color palette of dots
  var colorPalette = d3.interpolateMagma;

// -- INITIALIZE VARIABLES --
// set dimensions of viz. w/ margins
  var margin = {top: 30, right: 75, bottom: 0, left: 250},
    width = 1000 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

  var body = d3.select("body");

// define scales (# pixels for each axis)
  var x = d3.scaleLinear()
    .range([0, width]);

  var y = d3.scaleBand() // Port d3.scale.ordinal to .scaleBand; rangeBands to range w/ paddingInner arg.
    .range([0, height])
    .paddingInner(0.2);

  var z = d3.scaleSequential(colorPalette);

// define look of axis
  var xAxis = d3.axisBottom()
    .scale(x)
    .ticks(5, "%");

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
      .attr("class", "top-label")
   .append("p")
      .text("percent of stunted children under 5");

  body.append("div")
      .attr("class", "clearfix")

// -- DATA --
// import data as csv.
  d3.csv("data/DHS_stunted_unweighted.csv", function(error, data){
    if(error) throw error;

    lz = data.filter(function(d) {return d.livelihood_zone;});

      //  var nested = d3.nest()
      //     .key(function(d) {return d.year;})
      //     .sortKeys(d3.ascending)
      //     .entries(data);
       //
      //     console.log(nested)

// set the domain (data range) of data
// ! Note: should make more extendable by looking for the max in _either_ avg2010 or avg2014.
  x.domain([0, d3.max(data, function(element) { return element.avg2010; })]);
  y.domain(data.map(function(element) {return element.livelihood_zone}));

  // z.domain([d3.max(data, function(element) { return element.avg; }), 0]);
  z.domain([1, 0.2]);

// create the SVG object
  var svg = body.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// image
  var imgs = svg.selectAll("image")
    .data(lz)
  .enter().append("image")
    .attr("xlink:href", function(d) {return "/img/" +  d.livelihood_zone + ".png"})
    .attr("x", d3.max(data, function(element) { return x(element.avg2010 * 1.03); }))
    .attr("y", function(d) {return y(d.livelihood_zone)})
    .attr("height", y.bandwidth());

// add the X gridlines
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," + height + ")")
    .call(make_x_gridlines()
    .tickSize(-height)
    .tickFormat("")
  );


// create dots.

// for 2014 data (copy of 2010 that gets changed)
  var dotGroup2014 = svg.append("g")
    .attr("class", "dot");


  dotGroup2014.selectAll("dot")
    .data(data)
  .enter().append("circle")
    .attr("cx", function(d) {return x(d.avg2010)})
    .attr("cy", function(d) {return y(d.livelihood_zone)+y.bandwidth()/2})
    .attr("r", radius)
    .style("fill", function(d) {return z(d.avg2010)})
    .style("fill-opacity", 1)
   .transition()
    // .delay(function(d,i) {return i*100;})
    .duration(4000)
    .attr("cx", function(d) {return x(d.avg2014)})
    .style("fill", function(d) {return z(d.avg2014)});


// draw the axes
  svg.append("g")
    .call(xAxis)
    .attr("class", "x axis")
    .attr("transform", "translate(0," + -margin.top + ")");

  svg.append("g")
    .call(yAxis)
    .attr("class","y axis")
    //  .attr("transform", "translate(775,0)");
    //  .attr("transform", "translate(" + width + margin.left - margin.right + "," + margin.top + ")");

     });
