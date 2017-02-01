// -- DEFINE CONSTANTS --

// radius of dots in pixels.
  var radius = 10;

// color palette of dots
  var colorPalette = d3.interpolateSpectral;

// place holder for which category selected
var selectedCat = "Livelihood Zone";
var selectedYear = 2014;

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

  // BUTTONS
  wealth = vis.select("#Wealth");



// -- DATA --
// import data as csv.
  d3.csv("data/fp.csv", function(error, data){
    if(error) throw error;


  // sort the average values, descendingly.
    data.sort(function(a,b) {return b.ave-a.ave;});

    // console.log(data)

    lz = data.filter(function(d) {return d.Variable;});

       var nested = d3.nest()
       .key(function(d) { return d.Category })
      //  .key(function(d) { return d.year; })
          // .sortKeys(d3.ascending)
          .entries(mcuData);
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
      .attr("id", function(d) {return d.key;})
      .attr("class", function(d) {return "button " + d.key;})
      .attr("x", function(d, i) {return i*150 + 10;})
      .attr("y",100)
      .text(function(d) {return d.key;})
      // #cde6c6
      .style("background-color", function(d,i) {return d.key == selectedCat ? "#dceed7" : "#eee";});
      // .selectAll(".button:before")
      // .style("border-color", function(d,i) {return d.key == selectedCat ? "#abdda4" : "#fdd";});


// -----------------------------------------------------------------------------



// DOMAINS -------------------------------------------------------------------------
// set the domain (data range) of data
// ! Note: y domain set after filtering the data.
  x.domain([0, d3.max(data, function(element) { return element.ave; })]);

  // z.domain([d3.max(data, function(element) { return element.avg; }), 0]);
  z.domain([-0.2, 0.6]);


// UPDATE Y DOMAIN
function updateY(data, selectedCat) {
  y.domain(data
    .filter(function(d) {return d.Category == selectedCat})
    .map(function(element) {return element.Variable})
  );

  console.log(y.domain())
}

// Initialize y-domain.
updateY(data, selectedCat);
// -----------------------------------------------------------------------------


// create the SVG object
  var svg = vis.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// x-axis label
    svg.append("text")
        .attr("class", "top-label")
        .attr("x", 0)
        .attr("y", -30)
        .text("percent of married women using modern contraception");

// FILTER THE DATA
// Outer g for dots.
    var g = svg.selectAll("g")
        .data(data)
      .enter().append("g")
      .filter(function(d) {return d.key == selectedCat});

      svg.selectAll("circle")
          .data(data)
      .enter().append("circle")
        .filter(function(d) {return d.Category == selectedCat })
        .filter(function(d) {return d.year == selectedYear })
          .attr("class", "dot")
          .attr("r", radius)
          .attr("cx", function(d) {return x(+d.ave);})
          .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
          .attr("fill", function(d) {return z(+d.ave);});


// nested version
      // g.selectAll("circle")
      // .filter(function(d) {return d.year == selectedYear})
      // // access the inner values:
      // .data(function(d) {return d.values})
      // .enter()
      //     .append("circle")
      //     .attr("class", "dot")
      //     .attr("r", radius)
      //     .attr("cx", function(d) {return x(+d.ave);})
      //     .attr("cy", function(d) {return y(d.Variable);})
      //     .attr("fill", function(d) {return z(+d.ave);});

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


  // CLICK : select a different category
  // Every time a button is clicked, do the following:
  // 1. turn off the old button color
  // 2. change the button color.
  // 3. revert to the average value for MCU (transition)
  // 4. update the y-axis (scales = "free_y")
  // 5. transition to the new values
  d3.selectAll("a.button")
  .on("click", function(d) {
    selectedCat = this.id;

    console.log(selectedCat);

    // Change the color of the buttons
    nav.selectAll("a")
      .style("background-color", function(d,i) {return d.key == selectedCat ? "#dceed7" : "#eee";})

      nav.selectAll("a.button:before")
        .style("background-color", function(d,i) {return d.key == selectedCat ? "#dceed7" : "#eee";})

// Change the y-axis.
updateY(data, selectedCat);
d3.selectAll(".y.axis")
  .call(yAxis)


// Update the dots
    d3.selectAll(".dot")
      .filter(function(d) {return d.Category == selectedCat })
      .filter(function(d) {return d.year == selectedYear })
      .transition(2000)
        .attr("r", radius)
        .attr("cx", function(d) {console.log(d); return x(+d.ave);})
        .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
        // .attr("fill", function(d) {return z(+d.ave);});
        .attr("fill", "red")
  })


function changeData() {
  svg.selectAll("circle")
          .data(data)
  .enter().append("circle")
    .filter(function(d) {return d.Category == "Age";})
    .filter(function(d) {return d.year == selectedYear })
    .transition(2000)
      .attr("class", "dot")
      .attr("r", radius)
      .attr("cx", function(d) {return x(+d.ave);})
      .attr("cy", function(d) {return y(d.Variable) + y.bandwidth()/2;})
      .attr("fill", function(d) {return z(+d.ave);});

}

changeData();

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
    //  .attr("transform", "translate(775,0)");
    //  .attr("transform", "translate(" + width + margin.left - margin.right + "," + margin.top + ")");

     });
