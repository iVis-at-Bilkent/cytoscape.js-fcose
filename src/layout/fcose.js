// n.b. .layoutPositions() handles all these options for you

const assign = require('../assign');

const defaults = Object.freeze({
  // animation
  animate: true, // whether or not to animate the layout
  animationDuration: 1000, // duration of animation in ms, if enabled
  animationEasing: undefined, // easing of animation, if enabled
  animateFilter: ( node, i ) => true, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions

  // viewport
  pan: undefined, // pan the graph to the provided position, given as { x, y }
  zoom: undefined, // zoom level as a positive number to set after animation
  fit: true, // fit the viewport to the repositioned nodes, overrides pan and zoom

  // modifications
  padding: undefined, // padding around layout
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  spacingFactor: undefined, // a positive value which adjusts spacing between nodes (>1 means greater than usual spacing)
  nodeDimensionsIncludeLabels: undefined, // whether labels should be included in determining the space used by a node (default true)
  transform: ( node, pos ) => pos, // a function that applies a transform to the final node position

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
    let nodes = eles.nodes();
    let nodeIndexes = new Map();  // map to keep indexes to nodes
    let allDistances = [];  //array to keep all distances between nodes
    let xCoords = [];
    let yCoords = [];
    const infinity = 100000000;
    const small = 0.000000001;
    let pi_tol = 0.0000001;
    
    // compute all pairs shortest path
    let allBFS = function(){
      
      for(let i = 0; i <nodes.length; i++){
        let distance = [];
      
        for(let j = 0; j < nodes.length; j++){
          if(j == i)
            distance[j] = 0;
          else
            distance[j] = infinity;
        }

        eles.bfs({roots: nodes[i], visit: function(v, e, u, i, depth){
            distance[nodeIndexes.get(v.id())] = (15 + nodes[i].width()/2 + v.width()/2) * depth;
          },
          directed: false
        });

        allDistances.push(distance); 
      }
    };
    
    let multGamma = function(array){
      let result = [];
      let sum = 0;
      
      for(let i = 0; i < nodes.length; i++){
        sum += array[i];
      }
      
      sum *= (-1)/nodes.length;
      
      for(let i = 0; i < nodes.length; i++){
        result[i] = sum + array[i];
      }     
      return result;
    };

    let multL = function(array){
      let result = [];
//      let sum = 0;
      
      for(let i = 0; i < nodes.length; i++){
        let sum = 0;
        for(let j = 0; j < nodes.length; j++){
          sum += -0.5 * allDistances[i][j] * array[j]; 
        }
        result[i] = sum;
      }
      
      return result;
    };

    let multCons = function(array, constant){
      let result = [];
      
      for(let i = 0; i < nodes.length; i++){
        result[i] = array[i] * constant;
      }
      
      return result;
    };

    let minusOp = function(array1, array2){
      let result = [];
      
      for(let i = 0; i < nodes.length; i++){
        result[i] = array1[i] - array2[i];
      }
      
      return result;
    };

    let dotProduct = function(array1, array2){
      let product = 0;
      
      for(let i = 0; i < nodes.length; i++){
        product += array1[i] * array2[i]; 
      }
      
      return product;
    };

    let mag = function(array){
      return Math.sqrt(dotProduct(array, array));
    };
    
    let normalize = function(array){
      let result = [];
      let magnitude = mag(array);
      
      for(let i = 0; i < nodes.length; i++){
        result[i] = array[i] / magnitude;
      }
      
      return result;
    };
    
    let powerIteration = function(){
      // two largest eigenvalues
      let theta1; 
      let theta2;
      
      // initial guesses for eigenvectors
      let Y1 = [];
      let Y2 = [];
      
      let V1 = [];
      let V2 = [];      
      
      for(let i = 0; i < nodes.length; i++){
        Y1[i] = Math.random();
        Y2[i] = Math.random();
      }
      
      Y1 = normalize(Y1);
      Y2 = normalize(Y2);
      
      let count = 0;
      // to keep track of the improvement ratio in power iteration
      let current = small; 
      let previous = small;
      
      let temp;
      
      while(true){
        count++;
        
        for(let i = 0; i < nodes.length; i++){
          V1[i] = Y1[i];
        }
        
        Y1 = multGamma(multL(multGamma(V1)));
        theta1 = dotProduct(V1, Y1);
        Y1 = normalize(Y1);
        
        current = dotProduct(V1, Y1);
        
        temp = Math.abs(current/previous);
        
        if(temp < 1 + pi_tol && temp > 1){
          break;
        }
        
        previous = current;        
      }
      
      for(let i = 0; i < nodes.length; i++){
        V1[i] = Y1[i];
      }
      
      count = 0;
      previous = small;
      while(true){
        count++;
        
        for(let i = 0; i < nodes.length; i++){
          V2[i] = Y2[i];
        }
        
        V2 = minusOp(V2, multCons(V1, (dotProduct(V1, V2))));
        Y2 = multGamma(multL(multGamma(V2)));
        theta2 = dotProduct(V2, Y2);
        Y2 = normalize(Y2);
        
        current = dotProduct(V2, Y2);
        
        temp = Math.abs(current/previous);
        
        if(temp < 1 + pi_tol && temp > 1){
          break;
        }
        
        previous = current;        
      }
      
      for(let i = 0; i < nodes.length; i++){
        V2[i] = Y2[i];
      }
      
      // theta1 now contains dominant eigenvalue
      // theta2 now contains the second-largest eigenvalue
      // V1 now contains theta1's eigenvector
      // V2 now contains theta2's eigenvector
      
      //populate the two vectors
      xCoords = multCons(V1, Math.sqrt(theta1));
      yCoords = multCons(V2, Math.sqrt(theta2));
      
    };
        

    // example positioning algorithm
    let getPositions = function( ele, i ){
      return {
//        x: Math.round( Math.random() * 500 ),
//        y: Math.round( Math.random() * 500 )
        x: xCoords[i],
        y: yCoords[i]
      };
    };

    // TODO replace this with your own positioning algorithm
    let getNodePos = function( ele, i ){
      let dims = ele.layoutDimensions( options ); // the space used by the node

      return getPositions( ele, i );
    };
    
    // assign indexes to nodes
    for(let i=0; i<nodes.length; i++){
      nodeIndexes.set(nodes[i].id(), i);
    }
    
    allBFS();
    
    // get the distance squared matrix
    for(let i = 0; i < nodes.length; i++){
      for(let j = 0; j < nodes.length; j++){
        allDistances[i][j] *= allDistances[i][j];
      }
    }
    
    powerIteration();
    
//    console.log(allDistances);
//    console.log(xCoords);
//    console.log(yCoords);
    
    // .layoutPositions() automatically handles the layout busywork for you
    nodes.layoutPositions( layout, options, getNodePos );
  }
}

module.exports = Layout;
