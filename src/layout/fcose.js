/**
  The implementation of the fcose layout algorithm
*/

const assign = require('../assign');
const { spectralLayout }= require('./spectral');
const { coseLayout }= require('./cose');

const defaults = Object.freeze({
  
  // Postprocessing options
  postProcessing: true,
  initialEnergyOnIncremental: 0.3,
  
  // animation
  animate: true, // whether or not to animate the layout
  animationDuration: 1000, // duration of animation in ms, if enabled
  animationEasing: undefined, // easing of animation, if enabled

  // viewport
  fit: true, // fit the viewport to the repositioned nodes, overrides pan and zoom

  // modifications
  padding: 10, // padding around layout
  nodeDimensionsIncludeLabels: false, // whether labels should be included in determining the space used by a node (default true)
  
  // positioning options
  randomize: true, // use random node positions at beginning of layout

  // layout event callbacks
  ready: () => {}, // on layoutready
  stop: () => {} // on layoutstop
});

class Layout {
  constructor( options ){
    this.options = assign( {}, defaults, options );
  }

  run(){
    let layout = this;
    let options = this.options;
    let cy = options.cy;
    let eles = options.eles;
    
    // Apply spectral layout
    let spectralResult = spectralLayout(options);
    let xCoords = spectralResult["xCoords"];
    let yCoords = spectralResult["yCoords"];
    
    // Apply cose layout as postprocessing
    let coseResult = coseLayout(options, spectralResult);
    
    // get each element's calculated position
    let getPositions = function(ele, i ){
      if(options.postProcessing) {
        if(typeof ele === "number") {
          ele = i;
        }
        let theId = ele.data('id');
        let lNode = coseResult[theId];

        return {
          x: lNode.getRect().getCenterX(),
          y: lNode.getRect().getCenterY()
        };
      }
      else{
        return {
          x: xCoords[i],
          y: yCoords[i]
        };
      }
    }; 
    
    // transfer calculated positions to nodes (positions of only simple nodes are evaluated, compounds are positioned automatically)
    eles.nodes().not(":parent").layoutPositions(layout, options, getPositions);    
    
    document.getElementById("spectral").innerHTML = Math.floor(spectral) + " ms";
    if(options.postProcessing){
      document.getElementById("cose").innerHTML = Math.floor(cose) + " ms";
      document.getElementById("total").innerHTML = Math.floor(spectral + cose) + " ms";
    }
    else{
      document.getElementById("cose").innerHTML = "N/A";
      document.getElementById("total").innerHTML = Math.floor(spectral) + " ms";
    }
  }
}

module.exports = Layout;