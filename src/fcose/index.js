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
  // whether to include labels in node dimensions. Valid in "proof" quality
  nodeDimensionsIncludeLabels: false,
  
  /* spectral layout options */
  
  // false for random, true for greedy
  samplingType: true,
  // sample size to construct distance matrix
  sampleSize: 25,
	// separation amount between nodes
	nodeSeparation: 75,
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
    let eles = options.eles;
   
    let spectralResult;
    let xCoords;
    let yCoords;
    let coseResult;
    
    if(options.randomize){
      // Apply spectral layout
      spectralResult = spectralLayout(options);
      xCoords = spectralResult["xCoords"];
      yCoords = spectralResult["yCoords"];
    }
    
    if(options.quality == "proof"){  
      // Apply cose layout as postprocessing
      coseResult = coseLayout(options, spectralResult);
    }
    
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
    
    // quality = "draft" and randomize = false are contradictive so in that case positions don't change
    if(!(options.quality == "draft" && !options.randomize)) {
      // transfer calculated positions to nodes (positions of only simple nodes are evaluated, compounds are positioned automatically)
      eles.nodes().not(":parent").layoutPositions(layout, options, getPositions); 
    }
    else{
      console.log("If randomize option is set to false, then quality option must be 'proof'.");
    }
    
  }
}

module.exports = Layout;