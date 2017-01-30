
/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 * responsiveness code based on http://blog.apps.npr.org/2014/05/19/responsive-charts.html
 */
var scrollVis = function() {
// Define std. transition length
stdTransition = 600;

// Define graphic aspect ratio.
// Based on iPad w/ 2/3 of max width taken up by vis., 2/3 of max height taken up by vis.: 1024 x 768 --> perserve aspect ratio of iPad

// var $graphic = $('#graphic');
// var graphic_data;
var graphic_aspect_width = 1;
var graphic_aspect_height = 1;
// var mobile_threshold = 500;
var pctVis = 2/3; // percent of #graphic occupied by #vis.

// window function to get the size of the outermost parent
var graphic = d3.select("#graphic");

var graphicSize = graphic.node().getBoundingClientRect();

console.log("d3: ")
console.log(graphicSize.width*pctVis)
console.log("jQ: ")
// console.log($graphic.width()*(2/3))

  // constants to define the size
  // and margins of the vis area, based on the outer vars.
var margin = { top: 10, right: 15, bottom: 25, left: 35 };
// var width = $graphic.width()* pctVis - margin.left - margin.right;
var width = graphicSize.width * pctVis - margin.left - margin.right;
var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

var numSlides = [0,1,2,3,4];

// clear out existing graphics
// $graphic.empty();


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

  var imgG = null;

  // breadcrumbs
  var breadcrumbs = null;

  // When scrolling to a new section
  // the activation function for that
  // section is called.
  var activateFunctions = [];
  // If a section has an update function
  // then it is called while scrolling
  // through the section with the current
  // progress through the section.
  var updateFunctions = [];


  // IMAGES
  var imageArray = [
    {url:"/img/rw-countryside.jpg", title:"Rwandan countryside"},
    {url:"/img/afr1.png", title:"First image"},
    {url:"/img/afr2.png", title:"Second image"},
    {url:"/img/afr3.png", title:"Third image"},
    {url:"/img/afr4.png", title:"Third image"},
    {url:"/img/afr5.png", title:"Third image"}];

  var imageCounter = 0;

  // Image annotations
  var annotArray = [
    {frame:0, x:100, y:100, text:"Areas in light pink have few people living in the area"},
    {frame:0, x:100, y:200, text:"... while areas in dark pink and purple have high population density"}];

  var annotCounter = 0;

    console.log(annotArray)

  /**
   * chart
   *
   * @param selection - the current d3 selection(s)
   *  to draw the visualization in. For this
   *  example, we will be drawing it in #vis
   */
   var chart = function(selection) {
     selection.each(function(words) {
       // create svg and give it a width and height
       svg = d3.select(this).selectAll("svg").data([words]);
       svg.enter().append("svg").append("g");

       svg.attr("width", width + margin.left + margin.right);
       svg.attr("height", height + margin.top + margin.bottom);

       // create group for images
       svg.append("g")
             .attr("id", "imgs");

       // this group element will be used to contain all
       // other elements.
       g = svg.select("g")
         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

         // this group element will be used to contain all
         // big image elements (mostly maps; could also be used for static visualizations).
         imgG = svg.select("#imgs")

// BREADCRUMBS
         // create svg and give it a width and height
//          breadcrumbs = d3.select("#breadcrumbs").selectAll("svg").data([numSlides]);
//          breadcrumbs.enter().append("svg").append("g");
//
//          breadcrumbs.attr("width", margin.left + margin.right);
//          breadcrumbs.attr("height", height + margin.top + margin.bottom);
//
//
//          // this group element will be used to contain all
//          // other elements.
//          gBr = breadcrumbs.select("g")
//          .attr("width", 50)
//          .attr("height", 40)
//            .attr("transform", "translate(" + graphicSize.width + "," + margin.top + ")").selectAll("circle")
// .data(numSlides)
// .enter().append()
// .attr("id", "breadcrumb")
// .attr("cx", 10)
// .attr("cy", 10)
// .attr("r", 10);

       setupVis(words);

       setupSections();

     });
   };



  /**
   * setupVis - creates initial elements for all
   * sections of the visualization.
   *
   */
  setupVis = function() {

// MAP: map
  afrMap = imgG.selectAll("image")
    .data(imageArray)
  .enter().append("image")
    .attr("class", "afr-map")
    .attr("xlink:href", function(d) {return d.url})
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("opacity", 0);

    // afrMap.attr("opacity", 0) //start invisible
    //   .transition().duration(1000) //schedule a transition to last 1000ms
    //   .delay(function(d,i){return i*2000;})
    //     //Delay the transition of each element according to its index
    //     // in your selection so that it won't start to appear
    //     // until one second after the last image reached full opacity.
    //     //The second parameter passed to any function you give to d3
    //     // is usually the index of that element within the current selection.
    //   .attr("opacity", 1);

// TEXT: annotations
imgG.selectAll("text")
  .data(annotArray)
.enter().append("text")
  .attr("class", "afr-annot")
  .attr("x", function(d) {return d.x;})
  .attr("y", function(d) {return d.y;})
  .text(function(d) {return d.text;})
  .attr("opacity", 0);

// circles: annotations


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
    activateFunctions[0] = show1;
    activateFunctions[1] = show2;
    activateFunctions[2] = show3;
    activateFunctions[3] = show4;
    activateFunctions[4] = show5;
    activateFunctions[5] = show6;
    activateFunctions[6] = show7;
    activateFunctions[7] = show8;
    activateFunctions[8] = show9;

    // updateFunctions are called while
    // in a particular section to update
    // the scroll progress in that section.
    // Most sections do not need to be updated
    // for all scrolling and so are set to
    // no-op functions.
    for(var i = 0; i < 9; i++) {
      updateFunctions[i] = function() {};
    }
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
   * showTitle - initial title
   *
   * hides: count title
   * (no previous step to hide)
   * shows: intro title
   *
   */

   function show1() {
     imageCounter = 0;

     changeImage();

    changeAnnot(1, 0);

   }

  function show2() {
    imageCounter = 1;

     changeImage();

     changeAnnot(0, 1);
  }

  function show3() {

  }


  function show4() {
    imageCounter = 2;

     changeImage();

// change annotations
     changeAnnot(1, 0);

// revert zoom
// NOTE: FIX!!
// afrMap
// .transition()
// .duration(stdTransition)
// .attr("transform", "translate(-100,-100)" + " scale(1)");
  }

  function show5() {
    afrMap
    .transition()
    .duration(stdTransition*2)
    .attr("transform", "translate(-1000, -700)" + " scale(3.5)");

    // NOTE: Cross-fade to the real image

  }

  function show6() {
// NOTE: outline Rwanda


// Reversal
imageCounter = 2;

 changeImage();
  }

  function show7() {
    // reset scale
         afrMap
         .transition()
         .duration(0)
         .attr("transform", "translate(-1000, -700)" + " scale(1)");
 imageCounter = 3;

     changeImage();


  }

  function show8() {
    imageCounter = 4;

     changeImage();
  }

  function show9() {
    imageCounter = 5;

     changeImage();
  }

// HELPER FUNCTIONS ---------

function changeImage() {
  // turn on current layer
  imgG.selectAll(".afr-map")
      .filter(function(d,i) {return i == imageCounter})
  .transition()
   .duration(stdTransition)
   .attr("opacity", 1);

   // turn off other layers
   imgG.selectAll(".afr-map")
       .filter(function(d,i) {return i != imageCounter})
   .transition()
    .duration(stdTransition)
    .attr("opacity", 0);
}


function changeAnnot(idxOn, idxOff, tDelay) {

  imgG.selectAll(".afr-annot")
    .filter(function(d) {return(d.frame == idxOn);})
 .transition()
   .delay(1000)
  .duration(stdTransition)
  .attr("opacity", 1)

  imgG.selectAll(".afr-annot")
    .filter(function(d) {return(d.frame == idxOff);})
 .transition()
   .delay(0)
  .duration(stdTransition)
  .attr("opacity", 0)
}
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
d3.tsv("", display);
