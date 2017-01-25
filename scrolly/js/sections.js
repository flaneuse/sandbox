
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */
var scrollVis = function() {
  // constants to define the size
  // and margins of the vis area.
  // var width = 600;
  // var height = 520;
  // var margin = {top:0, left:20, bottom:40, right:10};
  var margin = {top: 30, right: 75, bottom: 0, left: 250},
    width = 900 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

  // Keep track of which visualization
  // we are on and which was the last
  // index activated. When user scrolls
  // quickly, we want to call all the
  // activate functions that they pass.
  var lastIndex = -1;
  var activeIndex = 0;


  // main svg used for visualization
  var svg = null;

  // d3 selection that will be used
  // for displaying visualizations
  var g = null;


  // -- DEFINE CONSTANTS --

  // radius of dots in pixels.
       var radius = 10;




  // -- SCALES --
    // define scales (# pixels for each axis)
  /* D3.js VERSION 3
  */
  var x = d3.scale.linear()
       .range([0, width]);

  var y = d3.scale.ordinal()
       .rangeBands([0, height], 0.2, 0);

  var z = d3.scale.linear()
  .range(["red", "steelblue"])
    .interpolate(d3.interpolateLab)
       .domain([1, 0.2]);

  var xAxis = d3.svg.axis()
       .scale(x)
       .orient("top")
       .ticks(5, "%")
       .innerTickSize(height);

  var yAxis = d3.svg.axis()
       .scale(y)
       .orient("left");

// // gridlines
//   function make_x_gridlines() {
//          return d3.axis.orient("bottom").x
//          .ticks(5)
//        }

/* D3.js v. 4
  // color palette of dots
        var colorPalette = d3.interpolateSpectral;

       var x = d3.scaleLinear() // D3.js v.4
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
*/

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
  var chart = function(selection) {
    selection.each(function(rawData) {
      // create svg and give it a width and height
      svg = d3.select(this).selectAll("svg").data([rawData]);
      svg.enter().append("svg").append("g");

      svg.attr("width", width + margin.left + margin.right);
      svg.attr("height", height + margin.top + margin.bottom);


      // this group element will be used to contain all
      // other elements.
      g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// update all domains based on data.
// set the domain (data range) of data
// ! Note: should make more extendable by looking for the max in _either_ avg2010 or avg2014.

          x.domain([0, d3.max(rawData, function(element) { return element.avg2010; })]);

          y.domain(rawData.map(function(element) {return element.livelihood_zone}));

          // z.domain([d3.max(rawData, function(element) { return element.avg; }), 0]);


      setupVis(rawData);

      setupSections();

    });
  };


  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   * @param wordData - data object for each word.
   * @param fillerCounts - nested data that includes
   *  element for each filler word type.
   * @param histData - binned histogram data
   *
   * NOTE: don't be tempted to group the elements together. Makes selection for transitions more complicated than needs to be.
   */
  setupVis = function(data) {
    // x-axis
    g.append("g")
         .call(xAxis)
         .attr("class", "x axis")
         .attr("transform", "translate(0," + height + ")")
    g.select(".x.axis").style("opacity", 1); // ! Change to 0

    // y-axis
    g.append("g")
         .call(yAxis)
         .attr("class", "y axis")
    g.select(".y.axis").style("opacity", 1);

// FRAME 1: Initial national average, 2010.
    var dotGroup2010 = g.selectAll("dot")
         .data(data)
      .enter().append("circle")
          .attr("class", "dot y1")
         .attr("cx", function(d) {return x(d.natl2010)})
         .attr("cy", height/2)
         .attr("r", Math.sqrt(Math.pow(radius, 2)*13)) // Calc equal area.
         .style("fill", function(d) {return z(d.natl2010)});

    g.select(".dot.y1").style("opacity", 0);


// Dot mask to underlie 2010 data when opacity is changed.
        // var dotMask2010 = g.selectAll("dot")
        //      .data(data)
        //   .enter().append("circle")
        //      .attr("class", "dot")
        //      .attr("cx", function(d) {return x(d.avg2010)})
        //      .attr("cy", function(d) {return y(d.livelihood_zone)})
        //      .attr("r", radius) // Calc equal area.
        //      .style("fill", "white")
        //      .style("stroke", "white")
        //      .style("fill-opacity", 1)

    // FRAME 0: initial settings
    g.append("text")
      .attr("class", "title rwanda-title")
      .attr("x", width / 2)
      .attr("y", height / 3)
      .text("title");

    g.append("text")
      .attr("class", "sub-title rwanda-title")
      .attr("x", width / 2)
      .attr("y", (height / 3) + (height / 5) )
      .text("tbd");

    g.selectAll(".rwanda-title")
      .attr("opacity", 0);

  };

  /**
   * setupSections - each section is activated
   * by a separate function. Here we associate
   * these functions to the sections based on
   * the section's index.
   *
   */
  setupSections = function() {
    // activateFunctions are called each
    // time the active section changes
    activateFunctions[0] = showInit;
    activateFunctions[1] = showNatl2010;
    activateFunctions[2] = showLZ2010;
    activateFunctions[3] = show3;
    activateFunctions[4] = show4;
    activateFunctions[5] = show5;
    activateFunctions[6] = show6;
    activateFunctions[7] = show7;
    activateFunctions[8] = show6;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for(var i = 0; i < 9; i++) {
      updateFunctions[i] = function() {};
    }
    // If using any updateFunctions, call it here.
  };

  /**
   * ACTIVATE FUNCTIONS
   *
   * These will be called their
   * section is scrolled to.
   *
   * General pattern is to ensure
   * all content for the current section
   * is transitioned in, while hiding
   * the content for the previous section
   * as well as the next section (as the
   * user may be scrolling up or down).
   *
   */

  /**
   * showInit - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */
  function showInit() {
    // previous (null)

    // subsequent
    g.selectAll(".dot.y1")
      .transition()
      .duration(0)
      .style("opacity", 0);

    // show current
    g.selectAll(".rwanda-title")
      .transition()
      .duration(600)
      .style("opacity", 1.0);
  }

  /**
   * showNatl2010 - show the nat'l avg. in 2010
   *
   * hides: intro title
   * hides: transition nat'l --> LZ.
   * shows: nat'l avg.
   *
   */
  function showNatl2010() {
    // previous
    g.selectAll(".rwanda-title")
      .transition()
      .duration(0)
      .style("opacity", 0);


    // current: make nat'l avg. appear.
    g.selectAll(".dot.y1")
      .transition()
      .duration(600)
      .style("opacity", 1.0)
      // recode the cx, cy, r, fill to reverse transition if needed.
      .attr("cx", function(d) {return x(d.natl2010)})
      .attr("cy", height/2)
      .attr("r", Math.sqrt(Math.pow(radius, 2)*13)) // Calc equal area.
      .style("fill", function(d) {return z(d.natl2010)});
  }


  /**
   * showLZ2010 - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function showLZ2010() {
    // previous
    g.selectAll(".rwanda-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    // current: divide into LZ.
    g.selectAll(".dot.y1")
      .transition()
        .duration(600)
        .attr("r", radius)
        .attr("cy", function(d) {return y(d.livelihood_zone)})
  // .transition()
    // .delay(2500)
    // .duration(2000)
        .attr("cx", function(d) {return x(d.avg2010)})
        .style("fill", function(d) {return z(d.avg2010)});

        // subsequent
        g.selectAll(".square")
          .transition()
          .duration(0)
          .attr("opacity", 0);
  }

  /**
   * show3 - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function show3() {
    // previous
    g.selectAll(".rwanda-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    // subsequent
    g.selectAll(".square")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".count-title")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);
  }


  /**
   * showNatl2010 - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function show4() {
    // previous
    g.selectAll(".rwanda-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    // subsequent
    g.selectAll(".square")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".count-title")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);
  }


  /**
   * showNatl2010 - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function show5() {
    // previous
    g.selectAll(".rwanda-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    // subsequent
    g.selectAll(".square")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".count-title")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);
  }


  /**
   * showNatl2010 - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function show6() {
    // previous
    g.selectAll(".rwanda-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    // subsequent
    g.selectAll(".square")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".count-title")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);
  }


  /**
   * showNatl2010 - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function show7() {
    // previous
    g.selectAll(".rwanda-title")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    // subsequent
    g.selectAll(".square")
      .transition()
      .duration(0)
      .attr("opacity", 0);

    g.selectAll(".count-title")
      .transition()
      .duration(600)
      .attr("opacity", 1.0);
  }



  /**
   * HELPER FUNCTIONS
   */


  /**
   * UPDATE FUNCTIONS
   *
   * These will be called within a section
   * as the user scrolls through it.
   *
   * We use an immediate transition to
   * update visual elements based on
   * how far the user has scrolled
   *
   */



  /**
   * DATA FUNCTIONS
   *
   * Used to coerce the data into the
   * formats we need to visualize
   *
   */



  /**
   * activate -
   *
   * @param index - index of the activated section
   */
  chart.activate = function(index) {
    activeIndex = index;
    var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
    var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
    scrolledSections.forEach(function(i) {
      activateFunctions[i]();
    });
    lastIndex = activeIndex;
  };

  /**
   * update
   *
   * @param index
   * @param progress
   */
  chart.update = function(index, progress) {
    updateFunctions[index](progress);
  };

  // return chart function
  return chart;
};


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data) {

  // create a new plot and
  // display it
  var plot = scrollVis();
  d3.select("#vis")
    .datum(data)
    .call(plot);

  // setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));

  // pass in .step selection as the steps
  scroll(d3.selectAll('.step'));

  // setup event handling
  scroll.on('active', function(index) {
    // highlight current step text
    d3.selectAll('.step')
      .style('opacity',  function(d,i) { return i == index ? 1 : 0.1; });

    // activate current section
    plot.activate(index);
  });

  scroll.on('progress', function(index, progress){
    plot.update(index, progress);
  });
}

// load data and display
d3.csv("data/dhs.csv", display);
