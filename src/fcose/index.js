/**
  The implementation of the fcose layout algorithm
*/

const assign = require('../assign');
const { spectralLayout }= require('./spectral');
const { coseLayout }= require('./cose');

const defaults = Object.freeze({
  
  // "draft" or "proof" 
  // - "draft" only applies spectral layout 
  // - "proof" improves the quality with subsequent CoSE layout  
  quality: "proof",
  // use random node positions at beginning of layout
  // if this is set to false, then quality option must be "proof"
  randomize: true, 
  // whether or not to animate the layout
  animate: true, 
  // duration of animation in ms, if enabled
  animationDuration: 1000, 
  // easing of animation, if enabled
  animationEasing: undefined, 
  // fit the viewport to the repositioned nodes
  fit: true, 
  // padding around layout
  padding: 10,
  // whether to include labels in node dimensions. Useful for avoiding label overlap
  nodeDimensionsIncludeLabels: false,
  
  /* spectral layout options */
  
  // false for random, true for greedy
  samplingType: true,
  // sample size to construct distance matrix
  sampleSize: 25,
  // power iteration tolerance
  piTol: 0.0000001,
  
  /* CoSE layout options */
  
  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 4500,
  // Ideal edge (non nested) length
  idealEdgeLength: 50,
  // Divisor to compute edge forces
  edgeElasticity: 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 0.1,
  // Gravity force (constant)
  gravity: 0.25,
  // Maximum number of iterations to perform
  numIter: 2500,
  // For enabling tiling
  tile: false,  
  // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingVertical: 10,
  // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8, 
  // Initial cooling factor for incremental layout  
  initialEnergyOnIncremental: 0.3,  

  /* layout event callbacks */
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
      if(options.quality == "proof") {
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