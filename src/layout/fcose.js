// n.b. .layoutPositions() handles all these options for you

const assign = require('../assign');
const numeric = require('numeric');
const cose = require('cytoscape-cose-bilkent');

const defaults = Object.freeze({
  
  // CMDS options
  sampling: true,
  postProcessing: true,
  initialEnergyOnIncremental: 0.2,
  
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
    let nodeSize = nodes.length;
    
    let nodeIndexes = new Map();  // map to keep indexes to nodes 
    let parentChildMap = new Map(); // mapping btw. compound and its representative node 
    let allDistances = [];  // array to keep all distances between nodes
    let allNodesNeighborhood = []; // array to keep neighborhood of all nodes
    let xCoords = [];
    let yCoords = [];
    
    let samplesColumn = [];   // sampled vertices
    let minDistancesColumn = [];
    let C = [];   // column sampling matrix
    let PHI = [];   // intersection of column and row sampling matrices 
    let INV = [];   // inverse of PHI 
    
    let firstSample;    // the first sampled node
    
    const infinity = 100000000;
    const small = 0.000000001;
    let piTol = 0.0000001;
    let sampling = options.sampling;
    let sampleSize = 25;
    let samplingType = 1;   // 0 for random, 1 for greedy
    
    // determine which columns(or rows) to be sampled
    let randomSampleCR = function() {
      let sample = 0;
      let count = 0;
      let flag = false;

      while(count < sampleSize){
        sample = Math.floor(Math.random() * nodeSize); 
       
        flag = false;
        for(let i = 0; i < count; i++){
          if(samplesColumn[i] == sample){
            flag = true;
            break;
          }
        }
        
        if(!flag){
          samplesColumn[count] = sample;
          count++;
        }
        else{
          continue;
        }
      }    
    };
    
    // takes the index of the node(pivot) to initiate BFS as a parameter
    let BFS = function(pivot, index, samplingMethod){
      let path = [];    // the front of the path
      let front = 0;    // the back of the path
      let back = 0;
      let current = 0;
      let temp;
      let distance = [];
      
      let max_dist = 0;    // the furthest node to be returned
      let max_ind = 1;
      
      for(let i = 0; i < nodeSize; i++){
        distance[i] = infinity;
      }
      
      path[back] = pivot;
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
          allDistances[pivot][current] = distance[current] * 75;
        }
        else{
          C[current][index] = distance[current] * 75;
        }
      }
      
      if(sampling){
        if(samplingMethod == 1){
          for(let i = 0; i < nodeSize; i++){
            if(C[i][index] < minDistancesColumn[i])
              minDistancesColumn[i] = C[i][index];
          }

          for(let i = 0; i < nodeSize; i++){
            if(minDistancesColumn[i] > max_dist ){
              max_dist = minDistancesColumn[i];
              max_ind = i;

            }
          }            
        }
      }
      return max_ind;
    };

    //  apply BFS to all nodes or selected samples
    let allBFS = function(samplingMethod){
      if(!sampling){
        for(let i = 0; i < nodeSize; i++){
          BFS(i);
        }
      }
      else{
        let sample;
        
        if(samplingMethod == 0){
          randomSampleCR();

          // call BFS
          for(let i = 0; i < sampleSize; i++){
            BFS(samplesColumn[i], i, samplingMethod, false);
          }          
        }
        else{
          sample = Math.floor(Math.random() * nodeSize);
          firstSample = sample;
          
          for(let i = 0; i < nodeSize; i++){
            minDistancesColumn[i] = infinity;
          } 
          
          for(let i = 0; i < sampleSize; i++){
            samplesColumn[i] = sample;
            sample = BFS(sample, i, samplingMethod);
          } 
                    
        }

        // form the squared distances for C
        for(let i = 0; i < nodeSize; i++){
          for(let j = 0; j < sampleSize; j++){
            C[i][j] *= C[i][j];  
          }
        }
        
        // form PHI
        for(let i = 0; i < sampleSize; i++){
          PHI[i] = [];  
        }

        for(let i = 0; i < sampleSize; i++){
          for(let j = 0; j < sampleSize; j++){
            PHI[i][j] = C[samplesColumn[j]][i];  
          }
        }        

      }
    };
    
    // perform the SVD algorithm and apply a regularization step)
    let sample = function(){
      
      let SVDResult = numeric.svd(PHI);

      let a_w = SVDResult.S;
      let a_u = SVDResult.U;
      let a_v = SVDResult.V;        
      
      let max_s = a_w[0]*a_w[0]*a_w[0];
      
      let a_Sig = [];
     
      //  regularization
      for(let i = 0; i < sampleSize; i++){
        a_Sig[i] = [];
        for(let j = 0; j < sampleSize; j++){
          a_Sig[i][j] = 0;
          if(i == j){
            a_Sig[i][j] = a_w[i]/(a_w[i]*a_w[i] + max_s/(a_w[i]*a_w[i]));
          }
        }
      }
      
      INV = multMat(multMat(a_v, a_Sig), numeric.transpose(a_u));
        
    };
 
    let multMat = function(array1, array2){
      let result = [];
      
      for(let i = 0; i < array1.length; i++){
          result[i] = [];
          for(let j = 0; j < array2[0].length; j++){
            result[i][j] = 0;
            for(let k = 0; k < array1[0].length; k++){
              result[i][j] += array1[i][k] * array2[k][j]; 
            }
          }
        } 
      return result;
    }; 
 
    let multGamma = function(array){
      let result = [];
      let sum = 0;
      
      for(let i = 0; i < nodeSize; i++){
        sum += array[i];
      }
      
      sum *= (-1)/nodeSize;
      
      for(let i = 0; i < nodeSize; i++){
        result[i] = sum + array[i];
      }     
      return result;
    };

    let multL = function(array){
      let result = [];
      let temp1 = [];
      let temp2 = [];
     
      if(!sampling){
        for(let i = 0; i < nodeSize; i++){
          let sum = 0;
          for(let j = 0; j < nodeSize; j++){
            sum += -0.5 * allDistances[i][j] * array[j]; 
          }
          result[i] = sum;
        }
      }
      else{
        // multiply by C^T
        for(let i = 0; i < sampleSize; i++){
          let sum = 0;
          for(let j = 0; j < nodeSize; j++){
            sum += -0.5 * C[j][i] * array[j]; 
          }
          temp1[i] = sum;
        }
        // multiply the result by INV
        for(let i = 0; i < sampleSize; i++){
          let sum = 0;
          for(let j = 0; j < sampleSize; j++){
            sum += INV[i][j] * temp1[j]; 
          }
          temp2[i] = sum;
        }  
        // multiply the result by C
        for(let i = 0; i < nodeSize; i++){
          let sum = 0;
          for(let j = 0; j < sampleSize; j++){
            sum += C[i][j] * temp2[j]; 
          }
          result[i] = sum;
        } 
      }

      return result;
    };

    let multCons = function(array, constant){
      let result = [];
      
      for(let i = 0; i < nodeSize; i++){
        result[i] = array[i] * constant;
      }
      
      return result;
    };

    let minusOp = function(array1, array2){
      let result = [];
      
      for(let i = 0; i < nodeSize; i++){
        result[i] = array1[i] - array2[i];
      }
      
      return result;
    };

    let dotProduct = function(array1, array2){
      let product = 0;
      
      for(let i = 0; i < nodeSize; i++){
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
      
      for(let i = 0; i < nodeSize; i++){
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
      
      for(let i = 0; i < nodeSize; i++){
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
        
        for(let i = 0; i < nodeSize; i++){
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
      
      for(let i = 0; i < nodeSize; i++){
        V1[i] = Y1[i];
      }

      count = 0;
      previous = small;
      while(true){
        count++;
        
        for(let i = 0; i < nodeSize; i++){
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
      
      for(let i = 0; i < nodeSize; i++){
        V2[i] = Y2[i];
      }

      // theta1 now contains dominant eigenvalue
      // theta2 now contains the second-largest eigenvalue
      // V1 now contains theta1's eigenvector
      // V2 now contains theta2's eigenvector
      
      //populate the two vectors
      xCoords = multCons(V1, Math.sqrt(Math.abs(theta1)));
      yCoords = multCons(V2, Math.sqrt(Math.abs(theta2)));

    };

    //  transfer calculated positions to nodes (positions of only simple nodes are calculated)
    let getPositions = function(ele, i ){
      if(options.postProcessing) {
        cy.nodes().not(":parent").positions(function( node, i ){
          return {
            x: xCoords[i],
            y: yCoords[i]
          };
        });
      }
      else{
        return {
          x: xCoords[i],
          y: yCoords[i]
        };
      }
    };
    
    //  form a parent-child map to keep representative node of each compound node  
    cy.nodes(":parent").forEach(function( ele ){
      let children = ele.children();
      
      let random = 0;
      while(children.nodes(":childless").length == 0){
        random = Math.floor(Math.random() * children.nodes().length); // if all children are compound then proceed randomly
        children = children.nodes()[0].children();
      }
      //  select the representative node - we can apply different methods here
//      random = Math.floor(Math.random() * children.nodes(":childless").length);
      let index = 0;
      let min = 1000;
      children.nodes(":childless").forEach(function(ele2, i){
        if(ele2.connectedEdges().length < min){
          min = ele2.connectedEdges().length;
          index = i;
        }
      });
      parentChildMap.set(ele.id(), children.nodes(":childless")[index]);
    });
    
    // assign indexes to nodes
    let index = 0;
    for(let i = 0; i < nodes.length; i++){
      if(!nodes[i].isParent()){
        nodeIndexes.set(nodes[i].id(), index);
        allNodesNeighborhood[index++] = nodes[i].neighborhood().nodes().not(":parent"); //  form neighborhood for simple nodes
      }
    }

    // add neighborhood relations of compound nodes
    cy.nodes(":parent").forEach(function( ele ){
      //  first add neighbors to representative node
      allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele.id()).id())] = allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele.id()).id())].union(ele.neighborhood().nodes().not(":parent"));
      ele.neighborhood().nodes(":parent").forEach(function(ele2, i){
        allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele.id()).id())] = allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele.id()).id())].union(parentChildMap.get(ele2.id()));
      });
      //  then add representative node to neighbors
      ele.neighborhood().nodes().not(":parent").forEach(function(ele3, i){
        allNodesNeighborhood[nodeIndexes.get(ele3.id())] = allNodesNeighborhood[nodeIndexes.get(ele3.id())].union(parentChildMap.get(ele.id()));
      });
      ele.neighborhood().nodes(":parent").forEach(function(ele3, i){
        allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele3.id()).id())] = allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele3.id()).id())].union(parentChildMap.get(ele.id()));
      });
    });
    
    //  nodeSize now only considers the size of transformed graph
    nodeSize = nodeIndexes.size;
    
    // instantiate the matrix keeping all-pairs-shortest path
    if(!sampling){
      // instantiates the whole matrix
      for(let i = 0; i < nodeSize; i++){
        allDistances[i] = [];
      }
    }
    else{
      // instantiates the partial matrices
      for(let i = 0; i < nodeSize; i++){
        C[i] = [];
      }
      for(let i = 0; i < sampleSize; i++){
        INV[i] = [];
      }    
    }
    
    var spectral = performance.now();

    allBFS(samplingType);
    
    if(sampling){
      sample();
    }
    
    // get the distance squared matrix
    if(!sampling){
      for(let i = 0; i < nodeSize; i++){
        for(let j = 0; j < nodeSize; j++){
          allDistances[i][j] *= allDistances[i][j];
        }
      }
    }
    
    powerIteration();
    
    spectral = performance.now() - spectral;

    if(options.postProcessing){
      getPositions();
      var cose = performance.now();
      var coseLayout = cy.layout({
        name: "cose-bilkent",
        randomize: false,
        initialEnergyOnIncremental: options.initialEnergyOnIncremental
      });

      coseLayout.run();
      cose = performance.now() - cose;
    }
    else{
      // .layoutPositions() automatically handles the layout busywork for you
      nodes.not(":parent").layoutPositions( layout, options, getPositions );
    }
    
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
