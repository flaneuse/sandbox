
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
  var margin = {top: 40, right: 75, bottom: 0, left: 250},
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

      // -- MILD DATA PROCESSING --
      // filter out just the livelihood zone names.
      lz = rawData.filter(function(d) {return d.livelihood_zone;});

      natlData = rawData.filter(function(d, i) {return i == 0}) // just get one, not loads.


      setupVis(rawData, lz, natlData);

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
  setupVis = function(data, lz, natlData) {
    // Common chart elements

    // x-axis
    g.append("g")
         .call(xAxis)
         .attr("class", "x axis")
         .attr("transform", "translate(0," + height + ")")
         .style("opacity", 0); // ! Change to 0

    // y-axis
    g.append("g")
         .call(yAxis)
         .attr("class", "y axis")
         .style("opacity", 0);

    // x-axis title
    g.append("text")
          .attr("class", "x label")
          .attr("x", 0)
          .attr("y", -20)
          .text("percent of stunted children under 5 (2010)")
          .style("opacity", 0);

    // images (lz icons)
     var imgs = g.selectAll("image")
        .data(lz)
     .enter().append("image")
        .attr("class", "lz-icons")
         .attr("xlink:href", function(d) {return "/img/" +  d.livelihood_zone + ".png"})
         .attr("x", d3.max(data, function(element) { return x(element.avg2010 * 1.03); }))
         .attr("y", function(d) {return y(d.livelihood_zone)})
        //  .attr("height", y.bandwidth())
         .attr("height", 33) // NOTE: hard code temporarily
         .style("opacity", 0);


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
           .style("opacity", 0);

// FRAME 2: Natl. avg line
   svg.selectAll("g").selectAll(".natl")
       .data(natlData)
     .enter().append("line")
       .attr("class", "natl")
       .attr("y1", 0)
       .attr("y2", height + margin.top + margin.bottom)
       .attr("x1", function(d) {return x(d.natl2010)})
       .attr("x2", function(d) {return x(d.natl2010)})
       .style("opacity", 0);

   // national annotation
   svg.selectAll("g").selectAll(".natl-annot")
         .data(natlData)
       .enter().append("text")
         .attr("class", "natl natl-annot")
         .attr("x", function(d) {return x(d.natl2010)})
         .attr("y", 40) // NOTE: hard coding for now.
         // .attr("y", y.bandwidth())
         .attr("dx", -10)
         .text(function(d) {return "national average: " + d3.format(".0%")(d.natl2010)})
         .style("opacity", 0);

// FRAME 3: map
           svg.append("image")
             .attr("class", "rw-map")
             .attr("xlink:href", function(d) {return "/img/dhs2010_choro_lab.png"})
             .attr("width", "100%")
             .attr("height", "100%")
             .style("opacity", 0);


// FRAME 1: Initial national average, 2010.
    var dotGroup2010 = g.selectAll("dot")
         .data(data)
      .enter().append("circle")
          .attr("class", "dot y1")
         .attr("cx", function(d) {return x(d.natl2010)})
         .attr("cy", height/2)
         .attr("r", Math.sqrt(Math.pow(radius, 2)*13)) // Calc equal area.
         .style("fill", function(d) {return z(d.natl2010)})
         .style("opacity", 0);

  // value label for nat'l avg.
    var natlLabel = svg.selectAll("g").selectAll(".natl-value")
      .data(natlData)
    .enter().append("text")
      .attr("class", "natl-value")
      .attr("x", function(d) {return x(d.natl2010)})
      .attr("y", height/2)
      .attr("dy", 10) // 1/2 of font size, so more centered.
      .text(function(d) {return d3.format(".0%")(d.natl2010)})
      .style("opacity", 0);

// FRAME 2: Annotations
// labels
      var pctLab = svg.selectAll("g").selectAll(".val-labels")
          .data(data)
          .enter().append("text")
            .attr("class", "val-labels")
            .filter(function(d, i) {return i == 0 | i == 12;})
            .attr("x", function(d) {return x(d.avg2010)})
            .attr("dx", -radius*2)
            .attr("y", function(d) {return y(d.livelihood_zone)})
            // .attr("y", function(d) {return y(d.livelihood_zone)+y.bandwidth()/2})
            // .attr("dy", y.bandwidth()/4)
            .text(function(d) {return d3.format(".0%")(d.avg2010)})
            .style("opacity", 0)



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
    activateFunctions[3] = showMap;
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
   * -- FRAME 0 --
   * showInit - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */
  function showInit() {
    // previous (null)

    // subsequent: hide natl avg. graph
    g.selectAll(".dot.y1")
      .transition()
      .duration(0)
      .style("opacity", 0);

      hideX();

    g.selectAll(".natl-value")
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
   * -- FRAME 1 --
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
    showX();

    g.selectAll(".dot.y1")
      .transition()
      .duration(600)
      .style("opacity", 1.0)
      // recode the cx, cy, r, fill to reverse transition if needed.
      .attr("cx", function(d) {return x(d.natl2010)})
      .attr("cy", height/2)
      .attr("r", Math.sqrt(Math.pow(radius, 2)*13)) // Calc equal area.
      .style("fill", function(d) {return z(d.natl2010)});

    g.selectAll(".natl-value")
        .transition()
        .duration(600)
        .style("opacity", 1);

    // hide subsequent: remove y axis
    hideY();

    hideLZ();

    hideAvg();

    hideValues();
  }


  /**
   * FRAME 2
   * showLZ2010 - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function showLZ2010() {
    // previous
    g.selectAll(".natl-value")
      .transition()
      .duration(0)
      .style("opacity", 0);

    // current: divide into LZ.
    showY();

    showLZ();

    showAvg();

    g.selectAll(".dot.y1")
      .transition()
        .duration(600)
        .attr("r", radius)
        .attr("cy", function(d) {return y(d.livelihood_zone)})
        .attr("transform","translate(0,0)")
  .transition()
    .delay(1000)
    .duration(1500)
        .attr("cx", function(d) {return x(d.avg2010)})
        .style("fill", function(d) {return z(d.avg2010)});

    g.selectAll(".val-labels")
        .transition()
        .delay(2500)
        .duration(600)
        .style("opacity", 1.0)

        // subsequent
        svg.selectAll(".rw-map")
          .transition()
          .duration(0)
          .style("opacity", 0);
  }

  /**
   * showMap - filler counts
   *
   * hides: intro title
   * hides: square grid
   * shows: filler count title
   *
   */
  function showMap() {
    // previous
    hideX();
    hideY();
    hideLZ();
    hideAvg();
    hideValues();


    svg.selectAll(".rw-map")
      .transition()
      .duration(600)
      .style("opacity", 1);

    g.selectAll(".dot.y1")
        .transition()
        .duration(600)
        .attr("cx", function(d) {return d.imgX;})
        .attr("cy", function(d) {return d.imgY;})
        .attr("transform","translate(-105,-40)")
        .transition()
        // .delay(600)
        .delay(function(d, i) {return i*100 + 600;})
        .duration(2000)
        .style("opacity", 0.3);

// subsequent
    g.selectAll(".count-title")
      .transition()
      .duration(600)
      .style("opacity", 1.0);
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
      .style("opacity", 0);

    // subsequent
    g.selectAll(".square")
      .transition()
      .duration(0)
      .style("opacity", 0);

    g.selectAll(".count-title")
      .transition()
      .duration(600)
      .style("opacity", 1.0);
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
      .style("opacity", 0);

    // subsequent
    g.selectAll(".square")
      .transition()
      .duration(0)
      .style("opacity", 0);

    g.selectAll(".count-title")
      .transition()
      .duration(600)
      .style("opacity", 1.0);
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
      .style("opacity", 0);

    // subsequent
    g.selectAll(".square")
      .transition()
      .duration(0)
      .style("opacity", 0);

    g.selectAll(".count-title")
      .transition()
      .duration(600)
      .style("opacity", 1.0);
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
      .style("opacity", 0);

    // subsequent
    g.selectAll(".square")
      .transition()
      .duration(0)
      .style("opacity", 0);

    g.selectAll(".count-title")
      .transition()
      .duration(600)
      .style("opacity", 1.0);
  }



  /**
   * HELPER FUNCTIONS
   */
// -- X-AXIS --
function showX() {
  g.selectAll(".axis.x")
      .transition()
      .duration(600)
      .style("opacity", 1);

  g.selectAll(".x.label")
          .transition()
          .duration(600)
          .style("opacity", 1);
}

function hideX() {
  g.selectAll(".axis.x")
      .transition()
      .duration(0)
      .style("opacity", 0);

  g.selectAll(".x.label")
          .transition()
          .duration(0)
          .style("opacity", 0);
}

// -- Y-AXIS --
function showY(){
  g.selectAll(".axis.y")
    .transition()
    .duration(600)
    .style("opacity", 1.0);
}

function hideY() {
  g.selectAll(".axis.y")
    .transition()
    .duration(0)
    .style("opacity", 0);
}

// -- LIVELIHOOD ZONE MAPS --
   function showLZ() {
     g.selectAll(".lz-icons")
         .transition()
         .duration(600)
         .style("opacity", 1);
   }

  function hideLZ() {
        g.selectAll(".lz-icons")
            .transition()
            .duration(600)
            .style("opacity", 0);
      }
  // -- NATL AVG LINE --
  function showAvg() {
    g.selectAll(".natl")
    .transition()
    .duration(600)
    .style("opacity", 1)
  }

  function hideAvg() {
    g.selectAll(".natl")
    .transition()
    .duration(0)
    .style("opacity", 0)
  };

  // -- PCT LABELS --
  function hideValues() {
    g.selectAll(".val-labels")
    .transition()
    .duration(0)
    .style("opacity", 0)
};

  /**
  * TRANSITION VARIABLES
  **/
  var basicTransit = d3.transition()
    .delay(1000)
    .duration(4000);

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
