(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeFcose"] = factory();
	else
		root["cytoscapeFcose"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(3);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// Simple, internal Object.assign() polyfill for options objects etc.

module.exports = Object.assign != null ? Object.assign.bind(Object) : function (tgt) {
  for (var _len = arguments.length, srcs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    srcs[_key - 1] = arguments[_key];
  }

  srcs.forEach(function (src) {
    Object.keys(src).forEach(function (k) {
      return tgt[k] = src[k];
    });
  });

  return tgt;
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var impl = __webpack_require__(0);

// registers the extension on a cytoscape lib ref
var register = function register(cytoscape) {
  if (!cytoscape) {
    return;
  } // can't register if cytoscape unspecified

  cytoscape('layout', 'fcose', impl); // register with cytoscape.js
};

if (typeof cytoscape !== 'undefined') {
  // expose to global cytoscape (i.e. window.cytoscape)
  register(cytoscape);
}

module.exports = register;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// n.b. .layoutPositions() handles all these options for you

var assign = __webpack_require__(1);

var defaults = Object.freeze({
	// animation
	animate: true, // whether or not to animate the layout
	animationDuration: 1000, // duration of animation in ms, if enabled
	animationEasing: undefined, // easing of animation, if enabled
	animateFilter: function animateFilter(node, i) {
		return true;
	}, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions

	// viewport
	pan: undefined, // pan the graph to the provided position, given as { x, y }
	zoom: undefined, // zoom level as a positive number to set after animation
	fit: true, // fit the viewport to the repositioned nodes, overrides pan and zoom

	// modifications
	padding: undefined, // padding around layout
	boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
	spacingFactor: undefined, // a positive value which adjusts spacing between nodes (>1 means greater than usual spacing)
	nodeDimensionsIncludeLabels: undefined, // whether labels should be included in determining the space used by a node (default true)
	transform: function transform(node, pos) {
		return pos;
	}, // a function that applies a transform to the final node position

	// layout event callbacks
	ready: function ready() {}, // on layoutready
	stop: function stop() {} // on layoutstop
});

var Layout = function () {
	function Layout(options) {
		_classCallCheck(this, Layout);

		this.options = assign({}, defaults, options);
	}

	_createClass(Layout, [{
		key: "run",
		value: function run() {
			var layout = this;
			var options = this.options;
			var cy = options.cy;
			var eles = options.eles;
			var nodes = eles.nodes();
			var nodeIndexes = new Map(); // map to keep indexes to nodes
			var allDistances = []; // array to keep all distances between nodes
			var allNodesNeighborhood = []; // array to keep neighborhood of all nodes
			var xCoords = [];
			var yCoords = [];
			var infinity = 100000000;
			var pivots = []; // pivot nodes

			// takes the index of the node(pivot) to initiate BFS as a parameter
			var BFS = function BFS(pivot) {
				var path = [],
				    distance = [];
				var front = 0,
				    back = 0,
				    current = 0;
				var temp = void 0;

				for (var i = 0; i < nodes.length; i++) {
					distance[i] = infinity;
				}

				path[back] = pivot;
				distance[pivot] = 0;

				while (back >= front) {
					current = path[front++];
					var neighbors = allNodesNeighborhood[current];
					for (var _i = 0; _i < neighbors.length; _i++) {
						temp = nodeIndexes.get(neighbors[_i].id());
						if (distance[temp] == infinity) {
							distance[temp] = distance[current] + 1;
							path[++back] = temp;
						}
					}
					allDistances[pivot][current] = distance[current] * 45;
				}
			};

			var multConsArray = function multConsArray(array, constant) {
				var result = [];

				for (var i = 0; i < nodes.length; i++) {
					result[i] = array[i] * constant;
				}

				return result;
			};

			var multConsMatrix = function multConsMatrix(matrix, constant) {
				var result = [];
				for (var i = 0; i < matrix.length; i++) {
					result[i] = [];
					for (var j = 0; j < matrix[0].length; j++) {
						result[i][j] = matrix[i][j] * constant;
					}
				}
				return result;
			};

			var minusOp = function minusOp(array1, array2) {
				var result = [];

				for (var i = 0; i < nodes.length; i++) {
					result[i] = array1[i] - array2[i];
				}

				return result;
			};

			var dotProduct = function dotProduct(array1, array2) {
				if (array1.length != array2.length) {
					console.log("Error at dotProduct: array lengths did not match");
					return;
				}

				var product = 0;

				for (var i = 0; i < array1.length; i++) {
					product += array1[i] * array2[i];
				}

				return product;
			};

			var multiplyMatrix = function multiplyMatrix(a, b) {
				//TODO: Beautify & optimize
				var aNumRows = a.length,
				    aNumCols = a[0].length;
				var bNumRows = b.length,
				    bNumCols = b[0].length;
				var m = void 0;

				console.log("a rows:" + aNumRows + " a cols:" + aNumCols + " b rows:" + bNumRows + " b cols: " + bNumCols);

				if (aNumCols != bNumRows) {
					console.log("Error at multiplyMatrix: dimensions do not match");
				}

				if (bNumCols == undefined || bNumCols == null) {
					// matrix vector multiplication
					m = [];

					for (var r = 0; r < aNumRows; ++r) {
						m[r] = 0;
						for (var i = 0; i < aNumCols; ++i) {

							m[r] += a[r][i] * b[i];
						}
					}
				} else {
					// matrix matrix multiplication
					m = new Array(aNumRows); // initialize array of rows

					for (var _r = 0; _r < aNumRows; ++_r) {
						m[_r] = []; //m[r] = new Array(bNumCols); // initialize the current row
						for (var c = 0; c < bNumCols; ++c) {
							m[_r][c] = 0; // initialize the current cell
							for (var _i2 = 0; _i2 < aNumCols; ++_i2) {
								m[_r][c] += a[_r][_i2] * b[_i2][c];
							}
						}
					}
				}
				return m;
			};

			var normalize = function normalize(array) {
				var result = [];
				var magnitude = Math.sqrt(dotProduct(array, array));

				for (var i = 0; i < array.length; i++) {
					result[i] = array[i] / magnitude;
				}
				return result;
			};

			var transpose = function transpose(array) {
				var result = [];
				for (var i = 0; i < array[0].length; i++) {
					result[i] = [];
					for (var j = 0; j < array.length; j++) {
						result[i][j] = array[j][i];
					}
				}
				return result;
			};

			//TODO: This might not be working as intended. Check it later
			var chooseNextPivot = function chooseNextPivot(i) {
				//Find max in allDistances[i][j]
				var maxDistance = -infinity;
				var nextPivot = i;

				for (var j = 0; j < nodes.length; j++) {
					if (allDistances[i][j] > maxDistance) {
						nextPivot = j;
						maxDistance = allDistances[i][j];
					}
				}

				return nextPivot;
			};

			var highDimDraw = function highDimDraw(m) {
				pivots[0] = Math.floor(Math.random() * nodes.length);

				// TODO: change this to calculate only m pivots later.
				for (var i = 0; i < nodes.length; i++) {
					BFS(i); // allDistances[i][j] : dimension i of node j
				}

				for (var _i3 = 0; _i3 < m - 1; _i3++) {
					if (_i3 != m - 1) {
						pivots[_i3 + 1] = chooseNextPivot(_i3);
					}
				}
			};

			var printEigenvectors = function printEigenvectors(V, Y, numEigenVectors) {
				for (var i = 0; i < numEigenVectors; i++) {
					console.log('Y[' + i + '] :' + Y[i]);
					console.log('V[' + i + '] :' + V[i]);
				}
			};

			var powerIteration = function powerIteration(numEigenVectors) {
				var epsilon = 0.001;
				var Y = [],
				    V = [],
				    mean = [],
				    pivotDistances = [];

				// Prepare for PCA
				for (var i = 0; i < pivots.length; i++) {
					pivotDistances[i] = [];

					// Compute mean of the axis
					for (var j = 0; j < nodes.length; j++) {
						mean[i] = allDistances[i][j] / nodes.length;
					}

					//Center the data
					for (var _j = 0; _j < nodes.length; _j++) {
						pivotDistances[i][_j] = allDistances[i][_j] - mean[i];
					}
				}

				var pivotDistancesTranspose = transpose(pivotDistances);

				// Compute covariance matrix
				var cov = multConsMatrix(multiplyMatrix(pivotDistances, pivotDistancesTranspose), 1 / nodes.length); // S matrix mxm
				//console.log("cov dimensions: " + cov.length + "x" + cov[0].length);

				// init eigenvectors to random unit vectors
				for (var _i4 = 0; _i4 < numEigenVectors; _i4++) {
					Y[_i4] = [];
					V[_i4] = [];

					//Randomly initialize eigenvector i
					for (var m = 0; m < pivots.length; m++) {
						Y[_i4][m] = Math.random();
					}
					Y[_i4] = normalize(Y[_i4]); // unit vector of m x 1

					do {
						V[_i4] = Y[_i4];

						console.log("After assigning: ");
						printEigenvectors(V, Y, numEigenVectors);

						// orthogonalize against previous eigenvectors
						for (var _j2 = 1; _j2 < _i4; _j2++) {
							V[_i4] = minusOp(V[_i4], multConsArray(V[_j2]), dotProduct(V[_i4], V[_j2]));
						}
						console.log("After orthogonalization: ");
						printEigenvectors(V, Y, numEigenVectors);

						var tempMult = multiplyMatrix(cov, V[_i4]);
						console.log("temp mult: " + tempMult);
						console.log("dimensions: " + tempMult.length + " " + tempMult[0].length);

						Y[_i4] = normalize(tempMult);

						console.log("After mult cov: ");
						printEigenvectors(V, Y, numEigenVectors);
					} while (dotProduct(Y[_i4], V[_i4]) < 1 - epsilon);

					V[_i4] = Y[_i4];
				}

				console.log("After eigenvector calculation finished: ");
				printEigenvectors(V, Y, numEigenVectors);

				//populate the two vectors
				//xCoords = multConsArray(multiplyMatrix(pivotDistancesTranspose,V[0]),3);
				//yCoords = multConsArray(multiplyMatrix(pivotDistancesTranspose,V[1]),3);
				xCoords = multiplyMatrix(pivotDistancesTranspose, V[0]);
				yCoords = multiplyMatrix(pivotDistancesTranspose, V[1]);

				//yCoords = multCons(V[1], Math.sqrt(theta[1]));
				console.log('xCoords at power iteration: ' + xCoords);
			};

			// example positioning algorithm
			var getPositions = function getPositions(ele, i) {
				return {
					x: xCoords[i],
					y: yCoords[i]
				};
			};

			// TODO replace this with your own positioning algorithm
			var getNodePos = function getNodePos(ele, i) {
				var dims = ele.layoutDimensions(options); // the space used by the node

				return getPositions(ele, i);
			};

			// assign indexes to nodes
			for (var i = 0; i < nodes.length; i++) {
				nodeIndexes.set(nodes[i].id(), i);
			}

			// instantiate the matrix keeping all-pairs-shortest path
			for (var _i5 = 0; _i5 < nodes.length; _i5++) {
				allDistances[_i5] = [];
			}

			// instantiate the array keeping neighborhood of all nodes
			for (var _i6 = 0; _i6 < nodes.length; _i6++) {
				allNodesNeighborhood[_i6] = nodes[_i6].neighborhood().nodes();
			}

			if (nodes.length < 50) {
				highDimDraw(nodes.length - 1);
			} else {
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
			console.log('xCoords : \n' + xCoords);
			console.log('yCoords : \n' + yCoords);

			// .layoutPositions() automatically handles the layout busywork for you
			nodes.layoutPositions(layout, options, getNodePos);
		}
	}]);

	return Layout;
}();

module.exports = Layout;

/***/ })
/******/ ]);
});