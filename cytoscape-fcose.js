(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("numeric"));
	else if(typeof define === 'function' && define.amd)
		define(["numeric"], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeFcose"] = factory(require("numeric"));
	else
		root["cytoscapeFcose"] = factory(root["numeric"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_4__) {
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
var numeric = __webpack_require__(4);

var defaults = Object.freeze({

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
    key: 'run',
    value: function run() {
      var layout = this;
      var options = this.options;
      var cy = options.cy;
      var eles = options.eles;
      var nodes = eles.nodes();

      var nodeIndexes = new Map(); // map to keep indexes to nodes
      var edgeMap = new Map(); // map from source+target nodes to edge weight
      var allDistances = []; // array to keep all distances between nodes
      var allNodesNeighborhood = []; // array to keep neighborhood of all nodes
      var xCoords = [];
      var yCoords = [];

      var samplesColumn = []; // sampled vertices
      var minDistancesColumn = [];
      var C = []; // column sampling matrix
      var PHI = []; // intersection of column and row sampling matrices 
      var INV = []; // inverse of PHI  

      var firstSample = void 0; // the first sampled node

      var pivots = []; // pivot nodes
      var runtime = 0;
      var sampling = options.sampling;
      var sampleSize = 25;
      var pi_tol = 0.0000001;
      var infinity = 100000000;
      var small = 0.000000001;
      var samplingType = 1; // 0 for random, 1 for greedy

      // determine which columns(or rows) to be sampled
      var randomSampleCR = function randomSampleCR() {
        var sample = 0;
        var count = 0;
        var flag = false;

        while (count < sampleSize) {
          sample = Math.floor(Math.random() * nodes.length);

          flag = false;
          for (var i = 0; i < count; i++) {
            if (samplesColumn[i] == sample) {
              flag = true;
              break;
            }
          }

          if (!flag) {
            samplesColumn[count] = sample;
            count++;
          } else {
            continue;
          }
        }
      };

      // takes the index of the node(pivot) to initiate BFS as a parameter
      var BFS = function BFS(pivot, index, samplingMethod) {
        var path = [],
            distance = [];
        var front = 0,
            back = 0,
            current = 0;
        var temp = void 0;

        var max_dist = 0; // the furthest node to be returned
        var max_ind = 1;

        for (var i = 0; i < nodes.length; i++) {
          distance[i] = infinity;
          if (!options.CMDS) allDistances[pivot][i] = (nodes.length + 1) * 100;
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
          if (!sampling) {
            allDistances[pivot][current] = distance[current] * 100;
          } else {
            C[current][index] = distance[current] * 100;
          }
        }

        if (sampling) {
          if (samplingMethod == 1) {
            for (var _i2 = 0; _i2 < nodes.length; _i2++) {
              if (C[_i2][index] < minDistancesColumn[_i2]) minDistancesColumn[_i2] = C[_i2][index];
            }

            for (var _i3 = 0; _i3 < nodes.length; _i3++) {
              if (minDistancesColumn[_i3] > max_dist) {
                max_dist = minDistancesColumn[_i3];
                max_ind = _i3;
              }
            }
          }
        }
        return max_ind;
      };

      var allBFS = function allBFS(samplingMethod) {
        if (!sampling) {
          for (var i = 0; i < nodes.length; i++) {
            BFS(i);
          }
        } else {
          var _sample = void 0;

          if (samplingMethod == 0) {
            randomSampleCR();

            // call BFS
            for (var _i4 = 0; _i4 < sampleSize; _i4++) {
              BFS(samplesColumn[_i4], _i4, samplingMethod, false);
            }
          } else {
            _sample = Math.floor(Math.random() * nodes.length);
            //          sample = 1;
            firstSample = _sample;

            for (var _i5 = 0; _i5 < nodes.length; _i5++) {
              minDistancesColumn[_i5] = infinity;
            }

            for (var _i6 = 0; _i6 < sampleSize; _i6++) {
              samplesColumn[_i6] = _sample;
              _sample = BFS(_sample, _i6, samplingMethod);
            }
          }

          // form the squared distances for C
          for (var _i7 = 0; _i7 < nodes.length; _i7++) {
            for (var j = 0; j < sampleSize; j++) {
              C[_i7][j] *= C[_i7][j];
            }
          }

          // form PHI
          for (var _i8 = 0; _i8 < sampleSize; _i8++) {
            PHI[_i8] = [];
          }

          for (var _i9 = 0; _i9 < sampleSize; _i9++) {
            for (var _j = 0; _j < sampleSize; _j++) {
              PHI[_i9][_j] = C[samplesColumn[_j]][_i9];
            }
          }
        }
      };

      var dijkstra = function dijkstra(pivot) {
        var sptSet = []; //sptSet : shortest path tree set
        var min = void 0,
            minIndex = void 0,
            neighborIndex = void 0;
        var weight = void 0,
            neighbors = void 0;

        for (var i = 0; i < nodes.length; i++) {
          sptSet[i] = false;
          allDistances[pivot][i] = infinity;
        }
        allDistances[pivot][pivot] = 0; // assign distance as 0 for pivot so it's picked first

        for (var _i10 = 0; _i10 < nodes.length; _i10++) {
          // choose the node with the minimum distance & is not in sptSet
          min = infinity;
          for (var j = 0; j < nodes.length; j++) {
            //TODO: check if nodes.length -1 or nodes.length
            if (!sptSet[j] && allDistances[pivot][j] <= min) {
              min = allDistances[pivot][j];
              minIndex = j;
            }
          }

          // console.log("minIndex: "+ minIndex);
          sptSet[minIndex] = true;
          neighbors = allNodesNeighborhood[minIndex];

          // update distance of all adjacent nodes of minIndex
          for (var k = 0; k < neighbors.length; k++) {
            neighborIndex = nodeIndexes.get(neighbors[k].id());

            weight = edgeMap.get(edgeMapKey(nodes[minIndex].id(), neighbors[k].id()));
            if (weight == undefined) {
              weight = edgeMap.get(edgeMapKey(neighbors[k].id(), nodes[minIndex].id()));
            }

            if (!sptSet[neighborIndex] && allDistances[pivot][minIndex] < infinity && allDistances[pivot][minIndex] + weight < allDistances[pivot][neighborIndex]) {
              allDistances[pivot][neighborIndex] = allDistances[pivot][minIndex] + weight;
            }
          }
        }
        // console.log("allDistances["+pivot+"]: " + allDistances[pivot]);
      };

      // calculates all the necessary matrices involved in sampling (also performs the SVD algorithm)
      var sample = function sample() {

        var SVDResult = numeric.svd(PHI);

        var a_w = SVDResult.S;
        var a_u = SVDResult.U;
        var a_v = SVDResult.V;

        var max_s = a_w[0] * a_w[0] * a_w[0];

        var a_Sig = [];

        for (var i = 0; i < sampleSize; i++) {
          a_Sig[i] = [];
          for (var j = 0; j < sampleSize; j++) {
            a_Sig[i][j] = 0;
            if (i == j) {
              a_Sig[i][j] = a_w[i] / (a_w[i] * a_w[i] + max_s / (a_w[i] * a_w[i]));
            }
          }
        }

        INV = multMat(multMat(a_v, a_Sig), numeric.transpose(a_u));
      };

      var multMat = function multMat(array1, array2) {
        var result = [];

        for (var i = 0; i < array1.length; i++) {
          result[i] = [];
          for (var j = 0; j < array2[0].length; j++) {
            result[i][j] = 0;
            for (var k = 0; k < array1[0].length; k++) {
              result[i][j] += array1[i][k] * array2[k][j];
            }
          }
        }
        return result;
      };

      var multGamma = function multGamma(array) {
        var result = [];
        var sum = 0;

        for (var i = 0; i < nodes.length; i++) {
          sum += array[i];
        }

        sum *= -1 / nodes.length;

        for (var _i11 = 0; _i11 < nodes.length; _i11++) {
          result[_i11] = sum + array[_i11];
        }
        return result;
      };

      var multL = function multL(array) {
        var result = [];
        var temp1 = [];
        var temp2 = [];

        if (!sampling) {
          for (var i = 0; i < nodes.length; i++) {
            var sum = 0;
            for (var j = 0; j < nodes.length; j++) {
              sum += -0.5 * allDistances[i][j] * array[j];
            }
            result[i] = sum;
          }
        } else {
          // multiply by C^T
          for (var _i12 = 0; _i12 < sampleSize; _i12++) {
            var _sum = 0;
            for (var _j2 = 0; _j2 < nodes.length; _j2++) {
              _sum += -0.5 * C[_j2][_i12] * array[_j2];
            }
            temp1[_i12] = _sum;
          }
          // multiply the result by INV
          for (var _i13 = 0; _i13 < sampleSize; _i13++) {
            var _sum2 = 0;
            for (var _j3 = 0; _j3 < sampleSize; _j3++) {
              _sum2 += INV[_i13][_j3] * temp1[_j3];
            }
            temp2[_i13] = _sum2;
          }
          // multiply the result by C
          for (var _i14 = 0; _i14 < nodes.length; _i14++) {
            var _sum3 = 0;
            for (var _j4 = 0; _j4 < sampleSize; _j4++) {
              _sum3 += C[_i14][_j4] * temp2[_j4];
            }
            result[_i14] = _sum3;
          }
        }

        return result;
      };

      var multConsArray = function multConsArray(array, constant) {
        var result = [];

        for (var i = 0; i < array.length; i++) {
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
        if (array1.length != array2.length) {
          console.log("Error at dotProduct: array lengths did not match");
          return;
        }

        var result = [];

        for (var i = 0; i < array1.length; i++) {
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
        //TODO: optimize
        var aNumRows = a.length,
            aNumCols = a[0].length;
        var bNumRows = b.length,
            bNumCols = b[0].length;
        var m = void 0;

        if (aNumCols != bNumRows) {
          console.log("Error at multiplyMatrix: dimensions do not match");
          return;
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
              for (var _i15 = 0; _i15 < aNumCols; ++_i15) {
                m[_r][c] += a[_r][_i15] * b[_i15][c];
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

      var transpose = function transpose(matrix) {
        var result = [];
        for (var i = 0; i < matrix[0].length; i++) {
          result[i] = [];
          for (var j = 0; j < matrix.length; j++) {
            result[i][j] = matrix[j][i];
          }
        }
        return result;
      };

      var chooseNextPivot = function chooseNextPivot(i, d) {
        var maxDistance = -infinity;
        var nextPivot = i;
        var pivotCands = []; // pivot candidate nodes' indices
        var count = 0;
        var largestCandSize = -infinity,
            candSize = void 0;

        for (var j = 0; j < nodes.length; j++) {

          if (!options.weightedEdges) {
            // This previous version chooses simply the node with largest distance
            if (d[j] > maxDistance) {
              nextPivot = j;
              maxDistance = d[j];
            }
          } else {
            if (d[j] > maxDistance) {
              count = 0;
              maxDistance = d[j];
              pivotCands = [];
              pivotCands[count] = j;
            } else if (d[j] == maxDistance) {
              // there was a node which has the same largest distance
              count++;
              pivotCands[count] = j;
            }
          }

          // Choose the largest sized node among the nodes with the same largest distance
        }

        if (options.weightedEdges) {
          // Choose the pivot candidate with the largest size
          for (var k = 0; k < pivotCands.length; k++) {
            candSize = nodes[pivotCands[k]].width() > nodes[pivotCands[k]].height() ? nodes[pivotCands[k]].width() : nodes[pivotCands[k]].height();
            if (candSize > largestCandSize) {
              nextPivot = pivotCands[k];
              largestCandSize = candSize;
            }
          }
        }

        return nextPivot;
      };

      var highDimDraw = function highDimDraw(m, weighted) {
        // Choose p1 randomly
        pivots[0] = Math.floor(Math.random() * nodes.length);

        //d[1,...,n] <-- inf
        var d = []; //for distances
        for (var i = 0; i < nodes.length; i++) {
          d[i] = infinity;
        }

        for (var _i16 = 0; _i16 < m; _i16++) {
          if (weighted) dijkstra(pivots[_i16]);else BFS(pivots[_i16]); // allDistances[i][j] : dimension i of node j

          for (var j = 0; j < nodes.length; j++) {
            d[j] = d[j] < allDistances[pivots[_i16]][j] ? d[j] : allDistances[pivots[_i16]][j];
          }

          if (_i16 != m - 1) pivots[_i16 + 1] = chooseNextPivot(_i16, d);
        }

        console.log("pivots: " + pivots);
      };

      var powerIterationHDE = function powerIterationHDE(numEigenVectors) {
        var maxIterations = nodes.length * 250;
        var epsilon = 0.001;
        var Y = [],
            V = [],
            pivotDistances = [];
        var pivotDistancesTranspose = void 0,
            iteration = void 0;
        var notConverged = true;
        var oldDotP = void 0,
            dotP = void 0; // dot products
        var dotProductUnchangedIters = void 0; // # of iterations the dot product did not change for more than epsilon

        // Prepare for PCA
        // console.log("pivots " + pivots);
        for (var i = 0, mean = 0; i < pivots.length; i++, mean = 0) {
          pivotDistances[i] = [];

          // Compute mean of the axis
          for (var j = 0; j < nodes.length; j++) {
            mean += allDistances[pivots[i]][j] / nodes.length;
          }

          //Center the data
          for (var _j5 = 0; _j5 < nodes.length; _j5++) {
            pivotDistances[i][_j5] = allDistances[pivots[i]][_j5] - mean;
          }
        }

        pivotDistancesTranspose = transpose(pivotDistances);

        // Compute covariance matrix
        var cov = multConsMatrix(multiplyMatrix(pivotDistances, pivotDistancesTranspose), 1 / nodes.length); // S matrix mxm

        // Compute eigenvectors
        for (var _i17 = 0; _i17 < numEigenVectors; _i17++) {
          Y[_i17] = [];
          V[_i17] = [];

          // initialize eigenvector to random unit vectors
          for (var m = 0; m < pivots.length; m++) {
            Y[_i17][m] = Math.random();
          }
          Y[_i17] = normalize(Y[_i17]); // unit vector of m x 1

          iteration = 0;
          dotProductUnchangedIters = 0;
          oldDotP = dotProduct(Y[_i17], Y[_i17]);
          do {
            iteration++;
            V[_i17] = Y[_i17];

            // orthogonalize against previous eigenvectors
            for (var _j6 = 0; _j6 < _i17; _j6++) {
              V[_i17] = minusOp(V[_i17], multConsArray(V[_j6], dotProduct(V[_i17], V[_j6])));
            }

            Y[_i17] = normalize(multiplyMatrix(cov, V[_i17]));

            if (iteration % 5 == 1) {
              // epsilon += 0.001/maxIterations;
              dotP = dotProduct(Y[_i17], V[_i17]);
              notConverged = dotP < 1 - epsilon;

              if (Math.abs(dotP - oldDotP) < epsilon / 100) {
                // if dotProduct did not change much for the prev 20 iters,
                dotProductUnchangedIters++;
              }
              if (dotProductUnchangedIters >= 20) {
                // then converge.
                notConverged = false;
              }

              oldDotP = dotP;

              // console.log(dotProduct(Y[i], V[i]));
            }
          } while (notConverged && iteration < maxIterations);
          console.log("iter: " + iteration);

          V[_i17] = Y[_i17];
        }

        //populate the two vectors
        xCoords = multiplyMatrix(pivotDistancesTranspose, V[0]);
        yCoords = multiplyMatrix(pivotDistancesTranspose, V[1]); // V[numEigenVectors-1]);
      };

      var powerIterationCMDS = function powerIterationCMDS() {
        // two largest eigenvalues
        var theta1 = void 0;
        var theta2 = void 0;

        // initial guesses for eigenvectors
        var Y1 = [];
        var Y2 = [];

        var V1 = [];
        var V2 = [];

        for (var i = 0; i < nodes.length; i++) {
          Y1[i] = Math.random();
          Y2[i] = Math.random();
        }

        Y1 = normalize(Y1);
        Y2 = normalize(Y2);

        var count = 0;
        // to keep track of the improvement ratio in power iteration
        var current = small;
        var previous = small;

        var temp = void 0;

        while (true) {
          count++;

          for (var _i18 = 0; _i18 < nodes.length; _i18++) {
            V1[_i18] = Y1[_i18];
          }

          Y1 = multGamma(multL(multGamma(V1)));
          theta1 = dotProduct(V1, Y1);
          Y1 = normalize(Y1);

          current = dotProduct(V1, Y1);

          temp = Math.abs(current / previous);

          if (temp < 1 + pi_tol && temp > 1) {
            break;
          }

          previous = current;
        }

        for (var _i19 = 0; _i19 < nodes.length; _i19++) {
          V1[_i19] = Y1[_i19];
        }

        count = 0;
        previous = small;
        while (true) {
          count++;

          for (var _i20 = 0; _i20 < nodes.length; _i20++) {
            V2[_i20] = Y2[_i20];
          }

          V2 = minusOp(V2, multConsArray(V1, dotProduct(V1, V2)));
          Y2 = multGamma(multL(multGamma(V2)));
          theta2 = dotProduct(V2, Y2);
          Y2 = normalize(Y2);

          current = dotProduct(V2, Y2);

          temp = Math.abs(current / previous);

          if (temp < 1 + pi_tol && temp > 1) {
            break;
          }

          previous = current;
        }

        for (var _i21 = 0; _i21 < nodes.length; _i21++) {
          V2[_i21] = Y2[_i21];
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
      var getPositions = function getPositions(ele, i) {
        return {
          //        x: Math.round( Math.random() * 500 ),
          //        y: Math.round( Math.random() * 500 )
          x: xCoords[i],
          y: yCoords[i]
        };
      };

      var setSizeOfRandomNodes = function setSizeOfRandomNodes(size, probThreshold) {
        var mapIterator = nodeIndexes.keys();
        var n = void 0,
            newSize = void 0;
        var defaultSize = 30;
        cy.startBatch();
        for (var i = 0; i < nodeIndexes.size; i++) {
          n = cy.$('#' + mapIterator.next().value);

          if (Math.random() < probThreshold) {
            newSize = size;
          } else {
            //convert back to default position (in case a previous run altered the size)
            newSize = defaultSize;
          }

          cy.style().selector(n).style('width', '' + newSize).update();
          cy.style().selector(n).style('height', '' + newSize).update();

          // console.log("width of "+n+": "+ n.width());
        }
        cy.endBatch();
      };

      var edgeMapKey = function edgeMapKey(source, target) {
        return source + "-" + target;
      };

      var setEdgeWeightMap = function setEdgeWeightMap() {
        var source = void 0,
            target = void 0;
        var edges = cy.edges();
        var weight = void 0;
        var edgeMap = new Map();

        for (var i = 0; i < edges.length; i++) {
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
      var getNodePos = function getNodePos(ele, i) {
        var dims = ele.layoutDimensions(options); // the space used by the node

        return getPositions(ele, i);
      };

      // assign indexes to nodes
      for (var i = 0; i < nodes.length; i++) {
        nodeIndexes.set(nodes[i].id(), i);
      }

      // instantiate the matrix keeping all-pairs-shortest path
      if (!sampling) {
        // instantiates the whole matrix
        for (var _i22 = 0; _i22 < nodes.length; _i22++) {
          allDistances[_i22] = [];
        }
      } else {
        // instantiates the partial matrices
        for (var _i23 = 0; _i23 < nodes.length; _i23++) {
          C[_i23] = [];
        }
        for (var _i24 = 0; _i24 < sampleSize; _i24++) {
          INV[_i24] = [];
        }
      }

      // instantiate the array keeping neighborhood of all nodes
      for (var _i25 = 0; _i25 < nodes.length; _i25++) {
        allNodesNeighborhood[_i25] = nodes[_i25].neighborhood().nodes();
        // console.log("neighborhood of node i: "+ i);
        // console.log(allNodesNeighborhood[i]);
      }

      if (options.weightedEdges) {
        console.log("checked!");
        console.log(options.maxNodeSize);
        setSizeOfRandomNodes(options.maxNodeSize, 1 / 3);
        edgeMap = setEdgeWeightMap();
      } else {
        cy.startBatch();
        cy.style().selector('node').style('width', '30').update();
        cy.style().selector('node').style('height', '30').update();
        cy.endBatch();
      }

      if (options.CMDS) {
        if (!sampling) console.log("CMDS");else console.log("CMDS-sampling");

        runtime = performance.now();
        for (var _i26 = 0; _i26 < options.totalRuns; _i26++) {
          allBFS(samplingType);

          if (sampling) {
            sample();
          }

          // get the distance squared matrix
          if (!sampling) {
            for (var _i27 = 0; _i27 < nodes.length; _i27++) {
              for (var j = 0; j < nodes.length; j++) {
                allDistances[_i27][j] *= allDistances[_i27][j];
              }
            }
          }

          powerIterationCMDS();
        }

        runtime = (performance.now() - runtime) / options.totalRuns;
      } else {
        console.log("HDE");

        runtime = performance.now();

        for (var _i28 = 0; _i28 < options.totalRuns; _i28++) {
          if (nodes.length < 100) {
            highDimDraw(Math.floor(nodes.length / 2), options.weightedEdges);
          } else {
            highDimDraw(50, options.weightedEdges);
          }

          powerIterationHDE(2);
        }
        runtime = (performance.now() - runtime) / options.totalRuns;
      }

      document.getElementById("runtime").innerHTML = runtime;

      //    console.log(allDistances);
      //    console.log(xCoords);
      //    console.log(yCoords);

      // .layoutPositions() automatically handles the layout busywork for you
      nodes.layoutPositions(layout, options, getNodePos);
    }
  }]);

  return Layout;
}();

module.exports = Layout;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ })
/******/ ]);
});