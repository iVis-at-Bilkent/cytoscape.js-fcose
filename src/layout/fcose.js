// n.b. .layoutPositions() handles all these options for you

const assign = require('../assign');
const Matrix = require('ml-matrix').Matrix;
const SVD = require('ml-matrix').SVD;

const defaults = Object.freeze({
  
  // CMDS options
  sampling: true,
  
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
    let allDistances = [];  // array to keep all distances between nodes
    let allNodesNeighborhood = []; // array to keep neighborhood of all nodes
    let xCoords = [];
    let yCoords = [];
    
    let samplesColumn = [];   // sampled vertices
    let minDistancesColumn = [];
    let C = [];   // column sampling matrix
    let R = [];   // row sampling matrix
    let PHI = [];   // intersection of column and row sampling matrices 
    let INV = [];   // inverse of PHI 
    
    let firstSample;    // the first sampled node
    
    const infinity = 100000000;
    const small = 0.000000001;
    let piTol = 0.0000001;
    let sampling = options.sampling;
    let sampleSize = 25;
    let svdTol = 0.000000000001;
    let regParam = 3;   // this is the power of the first singular values in regularization parameter
    let samplingType = 1;   // 0 for random, 1 for greedy
    
    // determine which columns(or rows) to be sampled
    let randomSampleCR = function() {
      let sample = 0;
      let count = 0;
      let flag = false;

      while(count < sampleSize){
        sample = Math.floor(Math.random() * nodes.length) + 1; 
       
        flag = false;
        for(let i = 1; i <= count; i++){
          if(samplesColumn[i] == sample){
            flag = true;
            break;
          }
        }
        
        if(!flag){
          samplesColumn[++count] = sample;
        }
        else{
          continue;
        }
      }    
    };
    
    // takes the index of the node(pivot) to initiate BFS as a parameter
    let BFS = function(pivot, index, samplingMethod){
      let path = [];    // the front of the path
      let front = 1;    // the back of the path
      let back = 0;
      let current = 0;
      let temp;
      let distance = [];
      
      let max_dist = 0;    // the furthest node to be returned
      let max_ind = 1;
      
      for(let i = 1; i <= nodes.length; i++){
        distance[i] = infinity;
      }
      
      path[++back] = pivot;
      distance[pivot] = 0;
      
      while(back >= front){
        current = path[front++];
        let neighbors = allNodesNeighborhood[current];
        for(let i = 0; i < neighbors.length; i++){
          temp = nodeIndexes.get(neighbors[i].id());
          if(distance[temp] == infinity){
            distance[temp] = distance[current] + 1;
            path[++back] = temp;
          }
        }
        if(!sampling){
          allDistances[pivot][current] = distance[current] * 45;
        }
        else{
          C[current][index] = distance[current] * 45;
        }
      }
      
      if(sampling){
        if(samplingMethod == 1){
          for(let i = 1; i <= nodes.length; i++){
            if(C[i][index] < minDistancesColumn[i])
              minDistancesColumn[i] = C[i][index];
          }

          for(let i = 1; i <= nodes.length; i++){
            if(minDistancesColumn[i] > max_dist ){
              max_dist = minDistancesColumn[i];
              max_ind = i;

            }
          }            
        }
      }
      return max_ind;
    };

    let allBFS = function(samplingMethod){
      if(!sampling){
        for(let i = 1; i <= nodes.length; i++){
          BFS(i);
        }
      }
      else{
        let sample;
        
        if(samplingMethod == 0){
          randomSampleCR();

          // call BFS
          for(let i = 1; i <= sampleSize; i++){
            BFS(samplesColumn[i], i, samplingMethod, false);
          }          
        }
        else{
          sample = Math.floor(Math.random() * nodes.length) + 1;
//          sample = 2;
          firstSample = sample;
          
          for(let i = 1; i <= nodes.length; i++){
            minDistancesColumn[i] = infinity;
          } 
          
          for(let i = 1; i <= sampleSize; i++){
            samplesColumn[i] = sample;
            sample = BFS(sample, i, samplingMethod);
          } 
                    
        }

        // form the squared distances for C
        for(let i = 1; i <= nodes.length; i++){
          for(let j = 1; j <= sampleSize; j++){
            C[i][j] *= C[i][j];  
          }
        }
        
        // form PHI
        for(let i = 1; i <= sampleSize; i++){
          PHI[i] = [];  
        }
        
        for(let i = 1; i <= sampleSize; i++){
          for(let j = 1; j <= sampleSize; j++){
            PHI[i][j] = C[samplesColumn[j]][i];  
          }
        }        
//        console.log(PHI);
      }
    };
    
    // calculates all the necessary matrices involved in sampling (also performs the SVD algorithm)
    let sample = function(){
//      console.log("Performing SVD");      
      
      let a_A = Matrix.zeros(sampleSize, sampleSize);
      
      for(let i = 0; i < sampleSize; i++){
        for(let j = 0; j < sampleSize; j++){
          a_A.set(i, j, PHI[i+1][j+1]);
        }
      }
      
//      console.log(a_A);
      
      let SVDResult = new SVD(a_A);
      let a_w = SVDResult.diagonal;
      let a_u = SVDResult.leftSingularVectors;
      let a_v = SVDResult.rightSingularVectors;
      
//      console.log(a_w);  
//      console.log(a_u);        
//      console.log(a_v);        
      
      let max_s = a_w[0]*a_w[0]*a_w[0];
      let a_Sig = Matrix.zeros(sampleSize, sampleSize);
      
      for(let i = 0; i < sampleSize; i++){
        for(let j = 0; j < sampleSize; j++){
          if(i == j){
            a_Sig.set(i, j, a_w[i]/(a_w[i]*a_w[i] + max_s/(a_w[i]*a_w[i])));
          }
        }
      }
      
      let a_INV = Matrix.zeros(sampleSize, sampleSize);
      a_INV = a_v.mmul(a_Sig);
      a_INV = a_INV.mmul(a_u.transpose());
      
//      console.log(a_INV);
      
      for(let i = 0; i < sampleSize; i++){
        for(let j = 0; j < sampleSize; j++){
          INV[i+1][j+1] = a_INV.get(i, j);
        }
      }
    };
 
    let multGamma = function(array){
      let result = [];
      let sum = 0;
      
      for(let i = 1; i <= nodes.length; i++){
        sum += array[i];
      }
      
      sum *= (-1)/nodes.length;
      
      for(let i = 1; i <= nodes.length; i++){
        result[i] = sum + array[i];
      }     
      return result;
    };

    let multL = function(array){
      let result = [];
      let temp1 = [];
      let temp2 = [];
     
      if(!sampling){
        for(let i = 1; i <= nodes.length; i++){
          let sum = 0;
          for(let j = 1; j <= nodes.length; j++){
            sum += -0.5 * allDistances[i][j] * array[j]; 
          }
          result[i] = sum;
        }
      }
      else{
        // multiply by C^T
        for(let i = 1; i <= sampleSize; i++){
          let sum = 0;
          for(let j = 1; j <= nodes.length; j++){
            sum += -0.5 * C[j][i] * array[j]; 
          }
          temp1[i] = sum;
        }
        // multiply the result by INV
        for(let i = 1; i <= sampleSize; i++){
          let sum = 0;
          for(let j = 1; j <= sampleSize; j++){
            sum += INV[i][j] * temp1[j]; 
          }
          temp2[i] = sum;
        }  
        // multiply the result by C
        for(let i = 1; i <= nodes.length; i++){
          let sum = 0;
          for(let j = 1; j <= sampleSize; j++){
            sum += C[i][j] * temp2[j]; 
          }
          result[i] = sum;
        } 
      }

      return result;
    };

    let multCons = function(array, constant){
      let result = [];
      
      for(let i = 1; i <= nodes.length; i++){
        result[i] = array[i] * constant;
      }
      
      return result;
    };

    let minusOp = function(array1, array2){
      let result = [];
      
      for(let i = 1; i <= nodes.length; i++){
        result[i] = array1[i] - array2[i];
      }
      
      return result;
    };

    let dotProduct = function(array1, array2){
      let product = 0;
      
      for(let i = 1; i <= nodes.length; i++){
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
      
      for(let i = 1; i <= nodes.length; i++){
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
      
      for(let i = 1; i < nodes.length + 1; i++){
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
        
        for(let i = 1; i <= nodes.length; i++){
          V1[i] = Y1[i];
        }

        Y1 = multGamma(multL(multGamma(V1)));
        theta1 = dotProduct(V1, Y1);
        Y1 = normalize(Y1);
        
        current = dotProduct(V1, Y1);
        
        temp = Math.abs(current/previous);
        
        if(temp < 1 + piTol && temp > 1){
          break;
        }
        
        previous = current;        
      }
      
      for(let i = 1; i <= nodes.length; i++){
        V1[i] = Y1[i];
      }

      count = 0;
      previous = small;
      while(true){
        count++;
        
        for(let i = 1; i <= nodes.length; i++){
          V2[i] = Y2[i];
        }
        
        V2 = minusOp(V2, multCons(V1, (dotProduct(V1, V2))));
        Y2 = multGamma(multL(multGamma(V2)));
        theta2 = dotProduct(V2, Y2);
        Y2 = normalize(Y2);
        
        current = dotProduct(V2, Y2);
        
        temp = Math.abs(current/previous);
        
        if(temp < 1 + piTol && temp > 1){
          break;
        }
        
        previous = current;        
      }
      
      for(let i = 1; i <= nodes.length; i++){
        V2[i] = Y2[i];
      }

      // theta1 now contains dominant eigenvalue
      // theta2 now contains the second-largest eigenvalue
      // V1 now contains theta1's eigenvector
      // V2 now contains theta2's eigenvector
      
      //populate the two vectors
      xCoords = multCons(V1, Math.sqrt(Math.abs(theta1)));
      yCoords = multCons(V2, Math.sqrt(Math.abs(theta2)));
//      console.log(xCoords);
//      console.log(yCoords);
    };
        

    // example positioning algorithm
    let getPositions = function( ele, i ){
      return {
        x: xCoords[i+1],
        y: yCoords[i+1]
      };
    };

    // TODO replace this with your own positioning algorithm
    let getNodePos = function( ele, i ){
      let dims = ele.layoutDimensions( options ); // the space used by the node

      return getPositions( ele, i );
    };
    
    // assign indexes to nodes
    for(let i = 1; i <= nodes.length; i++){
      nodeIndexes.set(nodes[i-1].id(), i);
    }
    
    // instantiate the matrix keeping all-pairs-shortest path
    if(!sampling){
      // instantiates the whole matrix
      for(let i = 1; i <= nodes.length; i++){
        allDistances[i] = [];
      }
    }
    else{
      // instantiates the partial matrices
      for(let i = 1; i <= nodes.length; i++){
        C[i] = [];
      }
      for(let i = 1; i <= sampleSize; i++){
        INV[i] = [];
      }      
    }
    
    // instantiate the array keeping neighborhood of all nodes
    for(let i = 1; i <= nodes.length; i++){
      allNodesNeighborhood[i] = nodes[i-1].neighborhood().nodes();
    }
    
    allBFS(samplingType);
    
    if(sampling){
      sample();
    }
    
    // get the distance squared matrix
    if(!sampling){
      for(let i = 1; i <= nodes.length; i++){
        for(let j = 1; j <= nodes.length; j++){
          allDistances[i][j] *= allDistances[i][j];
        }
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
