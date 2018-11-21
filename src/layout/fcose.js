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
    let eles = options.eles;
    let nodes = eles.nodes();
    let nodeIndexes = new Map();  // map to keep indexes to nodes
    let allDistances = [];  // array to keep all distances between nodes
    let allNodesNeighborhood = []; // array to keep neighborhood of all nodes
    let xCoords = [];
    let yCoords = [];
    const infinity = 100000000;
    let pivots = []; // pivot nodes

    // takes the index of the node(pivot) to initiate BFS as a parameter
    let BFS = function(pivot){
      let path = [], distance = [];
      let front = 0, back = 0, current = 0;
      let temp;

      for(let i = 0; i < nodes.length; i++){
        distance[i] = infinity;
        allDistances[pivot][i] = nodes.length * Math.log10(nodes.length) * Math.log2(nodes.length) * 45;
        //TODO: ask about this choice
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
        allDistances[pivot][current] = distance[current] * Math.log10(nodes.length) * Math.log2(nodes.length) * 45;
      }
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

		let transpose = function(array){
			let result = [];
			for (let i = 0; i < array[0].length; i++){
				result[i] = [];
				for (let j = 0; j < array.length; j++){
					result[i][j] = array[j][i];
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

    let highDimDraw = function(m){
			// Choose p1 randomly
			pivots[0] = Math.floor(Math.random() * nodes.length);

			//d[1,...,n] <-- inf
			let d = []; //for distances
			for (let i = 0; i < nodes.length; i++){
				d[i] = infinity;
			}

      for(let i  = 0; i < m; i ++) {

				// console.log("d :" + d);
				// TODO: Make a check, if all distances are positive use dijkstra's algorithm instead
				BFS(pivots[i]); // allDistances[i][j] : dimension i of node j
				// console.log("allDistances["+pivots[i]+"] " + allDistances[pivots[i]]);

				for (let j = 0; j < nodes.length; j++)
					d[j] = ( d[j] < allDistances[pivots[i]][j] ) ? d[j] : allDistances[pivots[i]][j];

				if (i != m-1)
          pivots[i+1] = chooseNextPivot(i, d);
      }
		};

    // let printEigenvectors = function(V,Y, numEigenVectors){
		// 	for (let i = 0; i < numEigenVectors; i++) {
		// 		console.log('Y['+i+'] :'+ Y[i]);
		// 		console.log('V['+i+'] :'+ V[i]);
		// 	}
		// 	console.log("");
		// }

    let powerIteration = function(numEigenVectors) {
			const epsilon = 0.002, maxIterations = nodes.length * Math.log10(nodes.length) * 100;
			let Y = [], V = [], pivotDistances = [];
			let pivotDistancesTranspose, iteration;

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
			// console.log(cov);

			// Compute eigenvectors
			for (let i = 0; i < numEigenVectors; i++) {
				Y[i] = [];
				V[i] = [];

				// initialize eigenvector to random unit vectors
				for (let m = 0; m < pivots.length; m++) {
					Y[i][m] = Math.random();
				}
				Y[i] = normalize(Y[i]); // unit vector of m x 1

				// console.log("\n\nAT I : "+ i);
				iteration = 0;
				do {
					iteration++;
					V[i] = Y[i];

					// orthogonalize against previous eigenvectors
					for (let j = 0; j < i; j++) {
						V[i] = minusOp(V[i], multConsArray(V[j], dotProduct(V[i], V[j])));
						// console.log("ortho V["+i+"]: "+V[i]);
					}

					Y[i] = normalize(multiplyMatrix(cov, V[i]));

					// console.log("After mult cov: ");
					// printEigenvectors(V,Y,numEigenVectors);

					// console.log("CONVERGE: "+ dotProduct(Y[i], V[i]));
				} while (dotProduct(Y[i], V[i]) < 1 - epsilon && iteration < maxIterations);

				V[i] = Y[i];
			}

      //populate the two vectors
			xCoords = multiplyMatrix(pivotDistancesTranspose,V[0]);
			yCoords = multiplyMatrix(pivotDistancesTranspose,V[1]);

      // console.log('xCoords at power iteration: '+ xCoords);
			// console.log('yCoords at power iteration: '+ yCoords);
		};

    // example positioning algorithm
    let getPositions = function( ele, i ){
      return {
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
    for(let i = 0; i < nodes.length; i++){
      nodeIndexes.set(nodes[i].id(), i);
    }

    // instantiate the matrix keeping all-pairs-shortest path
    for(let i = 0; i < nodes.length; i++){
      allDistances[i] = [];
    }

    // instantiate the array keeping neighborhood of all nodes
    for(let i = 0; i < nodes.length; i++){
      allNodesNeighborhood[i] = nodes[i].neighborhood().nodes();
    }

    let t0 = performance.now();

    if (nodes.length < 50 ) {
			highDimDraw(Math.floor(nodes.length / 2)); // highDimDraw(nodes.length-1);
    }else {
			highDimDraw(50);
    }

		powerIteration(2);

		let t1 = performance.now();

    // console.log('allDistances : \n' + allDistances);
    // console.log('xCoords : \n'+ xCoords);
    // console.log('yCoords : \n' + yCoords);

    console.log("\nTotal runtime : " +(t1-t0) + " ms");

    // .layoutPositions() automatically handles the layout busywork for you
    nodes.layoutPositions( layout, options, getNodePos );
  }
}

module.exports = Layout;
