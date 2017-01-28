// -- DEFINE CONSTANTS --

// radius of dots in pixels.
  var radius = 10;

// color palette of dots
  var colorPalette = d3.interpolateSpectral;

// place holder for which category selected
var selectedCat = "Religion";
var selectedYear = 2014;

// -- INITIALIZE VARIABLES --
// set dimensions of viz. w/ margins
  var margin = {top: 30, right: 75, bottom: 0, left: 250},
    width = 1000 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

  var body = d3.select("body");

  var vis = d3.select("#vis");

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
      .attr("class", "clearfix")



// -- DATA --
// import data as csv.
  d3.csv("data/fp.csv", function(error, data){
    if(error) throw error;

    // Remove 2010 data


  // sort the average values, descendingly.
    data.sort(function(a,b) {return b.ave-a.ave;});

    console.log(data)

    lz = data.filter(function(d) {return d.Variable;});

       var nested = d3.nest()
       .key(function(d) { return d.Category })
      //  .key(function(d) { return d.year; })
          .sortKeys(d3.ascending)
          .entries(data.filter(function(d) {return d.year == selectedYear}));
          console.log(nested)


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
              .attr("class", "button")
              .attr("x", function(d, i) {return i*150 + 10;})
              .attr("y",100)
              .text(function(d) {return d.key;});

          //
          // body.selectAll("#top-nav")
          //     .data(nested)
          //     .enter().append("li")
          //   .attr("class", "button")
          //   .attr("id", "select-cat")
          //   .attr("x", function(d, i) {return i*150 + 10;})
          //   .attr("y",100)
          //   .text(function(d) {return d.key;});

// set the domain (data range) of data
// ! Note: y domain set after filtering the data.
  x.domain([0, d3.max(data, function(element) { return element.ave; })]);

  // z.domain([d3.max(data, function(element) { return element.avg; }), 0]);
  z.domain([-0.2, 0.6]);

// FILTER DATA
function filterData(nested, selectedYear, selectedCat){
  var filtered = nested
    // .data(function(d) {return d.values})
    .filter(function(d) {return d.Category == selectedCat})
    .filter(function(d) {return d.year == selectedYear});

console.log(filtered);

return(filtered);
}

filterData(nested, selectedYear, selectedCat)

// UPDATE Y DOMAIN
function updateY(data, selectedCat) {
  y.domain(data
    .filter(function(d) {return d.Category == selectedCat})
    .map(function(element) {return element.Variable})
  );
}

// Initialize y-domain.
updateY(data, selectedCat);

// create the SVG object
  var svg = vis.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// x-axis label
    svg.append("div")
        .attr("class", "top-label")
     .append("p")
        .text("percent of married women using modern contraception");

// FILTER THE DATA
// Outer g for dots.
    var g = svg.selectAll("g")
        .data(nested)
      .enter().append("g")
      .filter(function(d) {return d.key == selectedCat});




  // g.selectAll("text")
  // // we are getting the values of the countries like this:
  // .data(function(d) {return d.values})
  // .enter()
  //     .append("text")
  //     .attr("y", function(d, i) {return i*30 + 100;})
  //     .attr("x",200)
  //     .text(function(d) {return d.ave;});

      g.selectAll("circle")
      // we are getting the values of the countries like this:
      .data(function(d) {return d.values})
      .enter()
          .append("circle")
          .attr("class", "dot")
          .attr("r", radius)
          .attr("cx", function(d) {return x(+d.ave);})
          .attr("cy", function(d) {return y(d.Variable);})
          .attr("fill", function(d) {return z(+d.ave);});

// image
  // var imgs = svg.selectAll("image")
  //   .data(lz)
  // .enter().append("image")
  // .attr("xlink:href", function(d) {return "/img/Kigali city.png"})
  // // .attr("xlink:href", function(d) {return "/img/" +  d.Variable + ".png"})
  //   .attr("x", d3.max(data, function(element) { return x(element.ave * 1.03); }))
  //   .attr("y", function(d) {return y(d.Variable)})
  //   .attr("height", y.bandwidth());

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
    .attr("transform", "translate(0," + -margin.top + ")");

  svg.append("g")
    .call(yAxis)
    .attr("class","y axis")
    //  .attr("transform", "translate(775,0)");
    //  .attr("transform", "translate(" + width + margin.left - margin.right + "," + margin.top + ")");

     });
