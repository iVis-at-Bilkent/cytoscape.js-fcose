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
        allDistances[pivot][current] = distance[current] * 45;
      }
    };

		let multConsArray = function(array, constant){
			let result = [];

			for(let i = 0; i < nodes.length; i++){
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
			let result = [];

			for(let i = 0; i < nodes.length; i++){
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

		let multiplyMatrix = function(a, b) { //TODO: Beautify & optimize
			let aNumRows = a.length, aNumCols = a[0].length;
			let bNumRows = b.length, bNumCols = b[0].length;
			let m;

			console.log("a rows:" + aNumRows + " a cols:" + aNumCols + " b rows:" + bNumRows + " b cols: " + bNumCols);

			if (aNumCols != bNumRows) {
				console.log("Error at multiplyMatrix: dimensions do not match");
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

		//TODO: This might not be working as intended. Check it later
		let chooseNextPivot = function(i){
      //Find max in allDistances[i][j]
      let maxDistance = -infinity;
      let nextPivot = i;

      for(let j = 0; j < nodes.length; j++){
        if (allDistances[i][j] > maxDistance){
          nextPivot = j;
          maxDistance = allDistances[i][j];
        }
      }

      return nextPivot;
    };

    let highDimDraw = function(m){
      pivots[0] = Math.floor(Math.random() * nodes.length);

      // TODO: change this to calculate only m pivots later.
      for(let i = 0; i < nodes.length; i++){
				BFS(i); // allDistances[i][j] : dimension i of node j
			}

      for(let i  = 0; i < m -1; i ++) {
				if (i != m-1) {
          pivots[i+1] = chooseNextPivot(i);
				}
      }
		};

    let printEigenvectors = function(V,Y, numEigenVectors){
			for (let i = 0; i < numEigenVectors; i++) {
				console.log('Y['+i+'] :'+ Y[i]);
				console.log('V['+i+'] :'+ V[i]);
			}
		}

    let powerIteration = function(numEigenVectors) {
			const epsilon = 0.001;
			let Y = [], V = [], mean = [], pivotDistances = [];

			// Prepare for PCA
			for (let i = 0; i < pivots.length; i++){
				pivotDistances[i] = [];

				// Compute mean of the axis
				for (let j = 0; j < nodes.length; j++) {
					mean[i] = allDistances[i][j] / nodes.length;
				}

				//Center the data
				for (let j = 0; j < nodes.length; j++) {
					pivotDistances[i][j] = allDistances[i][j] - mean[i];
				}
			}

			let pivotDistancesTranspose = transpose(pivotDistances);

			// Compute covariance matrix
			let cov = multConsMatrix(multiplyMatrix(pivotDistances, pivotDistancesTranspose), 1 / nodes.length); // S matrix mxm
			//console.log("cov dimensions: " + cov.length + "x" + cov[0].length);

			// init eigenvectors to random unit vectors
			for (let i = 0; i < numEigenVectors; i++) {
				Y[i] = [];
				V[i] = [];

				//Randomly initialize eigenvector i
				for (let m = 0; m < pivots.length; m++) {
					Y[i][m] = Math.random();
				}
				Y[i] = normalize(Y[i]); // unit vector of m x 1

				do {
					V[i] = Y[i];

					console.log("After assigning: ");
					printEigenvectors(V,Y,numEigenVectors);

					// orthogonalize against previous eigenvectors
					for (let j = 1; j < i; j++) {
						V[i] = minusOp(V[i], multConsArray(V[j]), dotProduct(V[i], V[j]));
					}
					console.log("After orthogonalization: ");
					printEigenvectors(V,Y,numEigenVectors);

					let tempMult = multiplyMatrix(cov, V[i]);
					console.log("temp mult: "+ tempMult);
					console.log("dimensions: " + tempMult.length + " " + tempMult[0].length);


					Y[i] = normalize(tempMult);

					console.log("After mult cov: ");
					printEigenvectors(V,Y,numEigenVectors);


				} while (dotProduct(Y[i], V[i]) < 1 - epsilon);

				V[i] = Y[i];
			}


			console.log("After eigenvector calculation finished: ");
			printEigenvectors(V,Y,numEigenVectors);

      //populate the two vectors
      //xCoords = multConsArray(multiplyMatrix(pivotDistancesTranspose,V[0]),3);
			//yCoords = multConsArray(multiplyMatrix(pivotDistancesTranspose,V[1]),3);
			xCoords = multiplyMatrix(pivotDistancesTranspose,V[0]);
			yCoords = multiplyMatrix(pivotDistancesTranspose,V[1]);

			//yCoords = multCons(V[1], Math.sqrt(theta[1]));
      console.log('xCoords at power iteration: '+ xCoords);
      
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


    if (nodes.length < 50 ) {
			highDimDraw(nodes.length-1);
    }else {
			highDimDraw(50);
    }

    // // get the distance squared matrix
    // for(let i = 0; i < nodes.length; i++){
    //   for(let j = 0; j < nodes.length; j++){
    //     allDistances[i][j] *= allDistances[i][j];
    //   }
    // }

		//calculate means of axis

		powerIteration(2);
    
    console.log('allDistances : \n' + allDistances);
    console.log('xCoords : \n'+ xCoords);
    console.log('yCoords : \n' + yCoords);
    
    // .layoutPositions() automatically handles the layout busywork for you
    nodes.layoutPositions( layout, options, getNodePos );
  }
}

module.exports = Layout;
