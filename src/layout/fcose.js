// n.b. .layoutPositions() handles all these options for you

const assign = require('../assign');
let numeric = require('numeric');

const defaults = Object.freeze({
  
  CMDS: true,
  totalRuns: 1,
  // CMDS options
  sampling: false,
  // HDE options
  weightedEdges: false,
  maxNodeSize: 30,

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
    let edgeMap = new Map(); // map from source+target nodes to edge weight
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
    
    let pivots = []; // pivot nodes
		let runtime = 0;
    let sampling = options.sampling;
    let sampleSize = 25;
    let pi_tol = 0.0000001;
    const infinity = 100000000;
    const small = 0.000000001;
    let samplingType = 1;   // 0 for random, 1 for greedy
    
     // determine which columns(or rows) to be sampled
    let randomSampleCR = function() {
      let sample = 0;
      let count = 0;
      let flag = false;

      while(count < sampleSize){
        sample = Math.floor(Math.random() * nodes.length); 
       
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
      let path = [], distance = [];
      let front = 0, back = 0, current = 0;
      let temp;
      
      let max_dist = 0;    // the furthest node to be returned
      let max_ind = 1;

      for(let i = 0; i < nodes.length; i++){
        distance[i] = infinity;
        if(!options.CMDS)
          allDistances[pivot][i] = (nodes.length+1) * 100;
        //TODO: change the distance with something that is constant. Experiment.
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
          allDistances[pivot][current] = distance[current] * 100;
        }
        else{
          C[current][index] = distance[current] * 100;
        }
      }
      
      if(sampling){
        if(samplingMethod == 1){
          for(let i = 0; i < nodes.length; i++){
            if(C[i][index] < minDistancesColumn[i])
              minDistancesColumn[i] = C[i][index];
          }

          for(let i = 0; i < nodes.length; i++){
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
        for(let i = 0; i < nodes.length; i++){
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
          sample = Math.floor(Math.random() * nodes.length);
//          sample = 1;
          firstSample = sample;
          
          for(let i = 0; i < nodes.length; i++){
            minDistancesColumn[i] = infinity;
          } 
          
          for(let i = 0; i < sampleSize; i++){
            samplesColumn[i] = sample;
            sample = BFS(sample, i, samplingMethod);
          } 
                    
        }

        // form the squared distances for C
        for(let i = 0; i < nodes.length; i++){
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

    let dijkstra = function(pivot){
      let sptSet = []; //sptSet : shortest path tree set
      let min, minIndex, neighborIndex;
      let weight, neighbors;

      for (let i = 0; i < nodes.length; i++){
        sptSet[i] = false;
        allDistances[pivot][i] = infinity;
      }
      allDistances[pivot][pivot] = 0; // assign distance as 0 for pivot so it's picked first

      for (let i = 0; i < nodes.length; i++){
        // choose the node with the minimum distance & is not in sptSet
        min = infinity;
        for(let j = 0; j < nodes.length; j++){ //TODO: check if nodes.length -1 or nodes.length
          if(!sptSet[j] && allDistances[pivot][j] <= min){
            min = allDistances[pivot][j];
            minIndex = j;
          }
        }

        // console.log("minIndex: "+ minIndex);
        sptSet[minIndex] = true;
        neighbors = allNodesNeighborhood[minIndex];

        // update distance of all adjacent nodes of minIndex
        for(let k = 0; k < neighbors.length; k++){
          neighborIndex = nodeIndexes.get(neighbors[k].id());

          weight = edgeMap.get(edgeMapKey(nodes[minIndex].id(), neighbors[k].id()));
          if (weight == undefined) {
            weight = edgeMap.get(edgeMapKey(neighbors[k].id(), nodes[minIndex].id()));
          }

          if(!sptSet[neighborIndex] && allDistances[pivot][minIndex] < infinity
                                    && allDistances[pivot][minIndex] + weight < allDistances[pivot][neighborIndex]){
            allDistances[pivot][neighborIndex] = allDistances[pivot][minIndex] + weight;
          }
        }
      }
      // console.log("allDistances["+pivot+"]: " + allDistances[pivot]);
    };

    // calculates all the necessary matrices involved in sampling (also performs the SVD algorithm)
    let sample = function(){
      
      let SVDResult = numeric.svd(PHI);

      let a_w = SVDResult.S;
      let a_u = SVDResult.U;
      let a_v = SVDResult.V;       
      
      let max_s = a_w[0]*a_w[0]*a_w[0];
      
      let a_Sig = [];
     
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
      let temp1 = [];
      let temp2 = [];
     
      if(!sampling){
        for(let i = 0; i < nodes.length; i++){
          let sum = 0;
          for(let j = 0; j < nodes.length; j++){
            sum += -0.5 * allDistances[i][j] * array[j]; 
          }
          result[i] = sum;
        }
      }
      else{
        // multiply by C^T
        for(let i = 0; i < sampleSize; i++){
          let sum = 0;
          for(let j = 0; j < nodes.length; j++){
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
        for(let i = 0; i < nodes.length; i++){
          let sum = 0;
          for(let j = 0; j < sampleSize; j++){
            sum += C[i][j] * temp2[j]; 
          }
          result[i] = sum;
        } 
      }

      return result;
    };

    let multConsArray = function(array, constant){
      let result = [];

      for(let i = 0; i < array.length; i++){
        result[i] = array[i] * constant;
      }

      return result;
    };

    let multConsMatrix = function(matrix, constant) {
      let result = [];

      for (let i = 0; i < matrix.length; i++) {
        result[i] = [];
        for(let j = 0; j < matrix[0].length; j++){
          result[i][j] = matrix[i][j] * constant;
        }
      }
      return result;
    };

    let minusOp = function(array1, array2){
      if (array1.length != array2.length) {
        console.log("Error at dotProduct: array lengths did not match");
        return;
      }

      let result = [];

      for(let i = 0; i < array1.length; i++){
        result[i] = array1[i] - array2[i];
      }

      return result;
    };

    let dotProduct = function(array1, array2){
      if (array1.length != array2.length) {
        console.log("Error at dotProduct: array lengths did not match");
        return;
      }

      let product = 0;

      for(let i = 0; i < array1.length; i++){
        product += array1[i] * array2[i];
      }

      return product;
    };

    let multiplyMatrix = function(a, b) { //TODO: optimize
      let aNumRows = a.length, aNumCols = a[0].length;
      let bNumRows = b.length, bNumCols = b[0].length;
      let m;

      if (aNumCols != bNumRows) {
        console.log("Error at multiplyMatrix: dimensions do not match");
        return;
      }

      if (bNumCols == undefined || bNumCols == null){ // matrix vector multiplication
        m = [];

        for (let r = 0; r < aNumRows; ++r) {
          m[r] = 0;
          for (let i = 0; i < aNumCols; ++i) {
            m[r] += a[r][i] * b[i];
          }
        }

      }
      else { // matrix matrix multiplication
        m = new Array(aNumRows);  // initialize array of rows

        for (let r = 0; r < aNumRows; ++r) {
          m[r] = []; //m[r] = new Array(bNumCols); // initialize the current row
          for (let c = 0; c < bNumCols; ++c) {
            m[r][c] = 0;             // initialize the current cell
            for (let i = 0; i < aNumCols; ++i) {
              m[r][c] += a[r][i] * b[i][c];
            }
          }
        }
      }
      return m;
    };

    let normalize = function(array){
      let result = [];
      let magnitude = Math.sqrt(dotProduct(array, array));

      for(let i = 0; i < array.length; i++){
        result[i] = array[i] / magnitude;
      }
      return result;
    };

    let transpose = function(matrix){
      let result = [];
      for (let i = 0; i < matrix[0].length; i++){
        result[i] = [];
        for (let j = 0; j < matrix.length; j++){
          result[i][j] = matrix[j][i];
        }
      }
      return result;
    };

    let chooseNextPivot = function(i, d){
      let maxDistance = -infinity;
      let nextPivot = i;

      for(let j = 0; j < nodes.length; j++){
        if (d[j] > maxDistance){
          nextPivot = j;
          maxDistance = d[j];
        }
      }

      return nextPivot;
    };

    let highDimDraw = function(m, weighted){
      // Choose p1 randomly
      pivots[0] = Math.floor(Math.random() * nodes.length);

      //d[1,...,n] <-- inf
      let d = []; //for distances
      for (let i = 0; i < nodes.length; i++){
        d[i] = infinity;
      }

      for(let i  = 0; i < m; i ++) {
        if(weighted)
          dijkstra(pivots[i]);
        else
          BFS(pivots[i]); // allDistances[i][j] : dimension i of node j

        for (let j = 0; j < nodes.length; j++) {
          d[j] = (d[j] < allDistances[pivots[i]][j]) ? d[j] : allDistances[pivots[i]][j];
        }

        if (i != m-1)
          pivots[i+1] = chooseNextPivot(i, d);
      }
    };

    let powerIterationHDE = function(numEigenVectors) {
      const maxIterations = nodes.length * 250;
      let epsilon = 0.001;
      let Y = [], V = [], pivotDistances = [];
      let pivotDistancesTranspose, iteration;
      let notConverged = true;

      // Prepare for PCA
      // console.log("pivots " + pivots);
      for (let i = 0, mean = 0; i < pivots.length; i++, mean = 0){
        pivotDistances[i] = [];

        // Compute mean of the axis
        for (let j = 0; j < nodes.length; j++) {
          mean += allDistances[pivots[i]][j] / nodes.length;
        }

        //Center the data
        for (let j = 0; j < nodes.length; j++) {
          pivotDistances[i][j] = allDistances[pivots[i]][j] - mean;
        }
      }

      pivotDistancesTranspose = transpose(pivotDistances);

      // Compute covariance matrix
      let cov = multConsMatrix(multiplyMatrix(pivotDistances, pivotDistancesTranspose), 1 / nodes.length); // S matrix mxm

      // Compute eigenvectors
      for (let i = 0; i < numEigenVectors; i++) {
        Y[i] = [];
        V[i] = [];

        // initialize eigenvector to random unit vectors
        for (let m = 0; m < pivots.length; m++) {
          Y[i][m] = Math.random();
        }
        Y[i] = normalize(Y[i]); // unit vector of m x 1

        iteration = 0;
        do {
          iteration++;
          V[i] = Y[i];

          // orthogonalize against previous eigenvectors
          for (let j = 0; j < i; j++) {
            V[i] = minusOp(V[i], multConsArray(V[j], dotProduct(V[i], V[j])));
          }

          Y[i] = normalize(multiplyMatrix(cov, V[i]));

          if(iteration % 5 == 0){
            // epsilon += 0.001/maxIterations;
            notConverged = dotProduct(Y[i], V[i]) < 1 - epsilon;
          }

        } while (notConverged && iteration < maxIterations);
        // console.log("iter: "+iteration);

        V[i] = Y[i];
      }

      //populate the two vectors
      xCoords = multiplyMatrix(pivotDistancesTranspose,V[0]);
      yCoords = multiplyMatrix(pivotDistancesTranspose,V[2]);
    };

    let powerIterationCMDS = function(){
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
        
        V2 = minusOp(V2, multConsArray(V1, (dotProduct(V1, V2))));
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
      xCoords = multConsArray(V1, Math.sqrt(theta1));
      yCoords = multConsArray(V2, Math.sqrt(theta2));
      
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

    let setSizeOfRandomNodes = function(size, probThreshold) {
      let mapIterator = nodeIndexes.keys();
      let n, newSize;
      const defaultSize = 30;
      cy.startBatch();
      for (let i = 0; i < nodeIndexes.size; i++) {
        n = cy.$('#' + mapIterator.next().value);

        if (Math.random() < probThreshold) {
          newSize = size;
        } else { //convert back to default position (in case a previous run altered the size)
          newSize = defaultSize;
        }

        cy.style().selector(n).style('width', '' + newSize).update();
        cy.style().selector(n).style('height', '' + newSize).update();

        // console.log("width of "+n+": "+ n.width());
      }
      cy.endBatch();
    };

    let edgeMapKey = function(source, target){
      return source + "-" + target;
    };

    let setEdgeWeightMap = function(){
      let source, target;
      let edges = cy.edges();
      let weight;
      let edgeMap = new Map;

      for (let i = 0; i < edges.length; i++) {
        weight = 0;

        source = cy.$('#' + edges[i].data('source'));
        target = cy.$('#' + edges[i].data('target'));

        if (source.width() > source.height()) {
          weight += source.width();
        } else {
          weight += source.height();
        }
        if (target.width() > target.height()) {
          weight += target.width();
        } else {
          weight += target.height();
        }
  
        edgeMap.set(edgeMapKey(edges[i].data('source'), edges[i].data('target')), weight);
        // console.log("weight " + edges[i].data('weight'));
      }
      return edgeMap;
    };

    // TODO replace this with your own positioning algorithm
    let getNodePos = function( ele, i ){
      let dims = ele.layoutDimensions( options ); // the space used by the node

      return getPositions( ele, i );
    };

    // assign indexes to nodes
    for(let i = 0; i < nodes.length; i++){
      nodeIndexes.set(nodes[i].id(), i);
    }
    
    // instantiate the matrix keeping all-pairs-shortest path
    if(!sampling){
      // instantiates the whole matrix
      for(let i = 0; i < nodes.length; i++){
        allDistances[i] = [];
      }
    }
    else{
      // instantiates the partial matrices
      for(let i = 0; i < nodes.length; i++){
        C[i] = [];
      }
      for(let i = 0; i < sampleSize; i++){
        INV[i] = [];
      }      
    }


    // instantiate the array keeping neighborhood of all nodes
    for(let i = 0; i < nodes.length; i++){
      allNodesNeighborhood[i] = nodes[i].neighborhood().nodes();
      // console.log("neighborhood of node i: "+ i);
      // console.log(allNodesNeighborhood[i]);
    }

    if (options.weightedEdges) {
      console.log("checked!");
      console.log(options.maxNodeSize);
      setSizeOfRandomNodes(options.maxNodeSize,1/3);
      edgeMap = setEdgeWeightMap();
    }
    else {
      cy.startBatch();
      cy.style().selector('node').style('width', '30').update();
      cy.style().selector('node').style('height', '30').update();
      cy.endBatch();
    }

    if (options.CMDS) {
      if(!sampling)
        console.log("CMDS");
      else
        console.log("CMDS-sampling");

      runtime = performance.now();
			for (let i = 0; i < options.totalRuns; i++) {
        allBFS(samplingType);
        
        if(sampling){
          sample();
        }

        // get the distance squared matrix
        if(!sampling){
          for(let i = 0; i < nodes.length; i++){
            for(let j = 0; j < nodes.length; j++){
              allDistances[i][j] *= allDistances[i][j];
            }
          }
        }

        powerIterationCMDS();
			}

			runtime = (performance.now() - runtime)/options.totalRuns;

    }
    else {
      console.log("HDE");

      runtime = performance.now();

      for (let i = 0; i < options.totalRuns; i++) {
        if (nodes.length < 100 ) {
          highDimDraw(Math.floor(nodes.length / 2), options.weightedEdges);
        }else {
          highDimDraw(50, options.weightedEdges);
        }

        powerIterationHDE(3);
      }
      runtime = (performance.now() - runtime)/options.totalRuns;
    }

    document.getElementById("runtime").innerHTML = runtime;

//    console.log(allDistances);
//    console.log(xCoords);
//    console.log(yCoords);
    
    // .layoutPositions() automatically handles the layout busywork for you
    nodes.layoutPositions( layout, options, getNodePos );
  }
}

module.exports = Layout;
