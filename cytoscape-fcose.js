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
      var pivots = []; // pivot nodes
      var runtime = 0;
      var pi_tol = 0.0000001;
      var infinity = 100000000;
      var small = 0.000000001;
      var totalRuns = 10;

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
          allDistances[pivot][i] = (nodes.length + 1) * 100;
          //TODO: change the distance with something that is constant. Not log squared. Experiment.
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
          //TODO: distance multiplier --> constant between 450 & 45
          allDistances[pivot][current] = distance[current] * 100;
        }
      };

      var allBFS = function allBFS() {
        for (var i = 0; i < nodes.length; i++) {
          BFS(i);
        }
      };

      var multGamma = function multGamma(array) {
        var result = [];
        var sum = 0;

        for (var i = 0; i < nodes.length; i++) {
          sum += array[i];
        }

        sum *= -1 / nodes.length;

        for (var _i2 = 0; _i2 < nodes.length; _i2++) {
          result[_i2] = sum + array[_i2];
        }
        return result;
      };

      var multL = function multL(array) {
        var result = [];
        //      let sum = 0;

        for (var i = 0; i < nodes.length; i++) {
          var sum = 0;
          for (var j = 0; j < nodes.length; j++) {
            sum += -0.5 * allDistances[i][j] * array[j];
          }
          result[i] = sum;
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
              for (var _i3 = 0; _i3 < aNumCols; ++_i3) {
                m[_r][c] += a[_r][_i3] * b[_i3][c];
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

        for (var j = 0; j < nodes.length; j++) {
          if (d[j] > maxDistance) {
            nextPivot = j;
            maxDistance = d[j];
          }
        }

        return nextPivot;
      };

      var highDimDraw = function highDimDraw(m) {
        // Choose p1 randomly
        pivots[0] = Math.floor(Math.random() * nodes.length);

        //d[1,...,n] <-- inf
        var d = []; //for distances
        for (var i = 0; i < nodes.length; i++) {
          d[i] = infinity;
        }

        for (var _i4 = 0; _i4 < m; _i4++) {
          // TODO: If the graph is positively weighted then use dijkstra's algorithm instead
          BFS(pivots[_i4]); // allDistances[i][j] : dimension i of node j

          for (var j = 0; j < nodes.length; j++) {
            d[j] = d[j] < allDistances[pivots[_i4]][j] ? d[j] : allDistances[pivots[_i4]][j];
          }if (_i4 != m - 1) pivots[_i4 + 1] = chooseNextPivot(_i4, d);
        }
      };

      var powerIterationHDE = function powerIterationHDE(numEigenVectors) {
        // TODO: Make epsilon increase from 0.001 to 0.002 as the number of iterations increase
        // TODO: Experiment with the maxIterations needed when the layout reaches its convergence: if possible make maxIterations in correlation with n.
        var epsilon = 0.002,
            maxIterations = nodes.length * Math.log10(nodes.length) * 100;
        var Y = [],
            V = [],
            pivotDistances = [];
        var pivotDistancesTranspose = void 0,
            iteration = void 0;

        // Prepare for PCA
        // console.log("pivots " + pivots);
        for (var i = 0, mean = 0; i < pivots.length; i++, mean = 0) {
          pivotDistances[i] = [];

          // Compute mean of the axis
          for (var j = 0; j < nodes.length; j++) {
            mean += allDistances[pivots[i]][j] / nodes.length;
          }

          //Center the data
          for (var _j = 0; _j < nodes.length; _j++) {
            pivotDistances[i][_j] = allDistances[pivots[i]][_j] - mean;
          }
        }

        pivotDistancesTranspose = transpose(pivotDistances);

        // console.log("pivotDistancesTranspose: ");
        // printMatrixNaN(pivotDistancesTranspose);

        // Compute covariance matrix
        var cov = multConsMatrix(multiplyMatrix(pivotDistances, pivotDistancesTranspose), 1 / nodes.length); // S matrix mxm
        // console.log("cov :");
        // printMatrixNaN(cov);

        // Compute eigenvectors
        for (var _i5 = 0; _i5 < numEigenVectors; _i5++) {
          Y[_i5] = [];
          V[_i5] = [];

          // initialize eigenvector to random unit vectors
          for (var m = 0; m < pivots.length; m++) {
            Y[_i5][m] = Math.random();
          }
          Y[_i5] = normalize(Y[_i5]); // unit vector of m x 1

          // console.log("\n\nAT I : "+ i);
          iteration = 0;
          do {
            iteration++;
            V[_i5] = Y[_i5];

            // console.log("After assigning: ");
            // printEigenvectorsNaN(V,Y,numEigenVectors);

            // orthogonalize against previous eigenvectors
            for (var _j2 = 0; _j2 < _i5; _j2++) {
              V[_i5] = minusOp(V[_i5], multConsArray(V[_j2], dotProduct(V[_i5], V[_j2])));
              // console.log("ortho V["+i+"]: "+V[i]);
            }

            Y[_i5] = normalize(multiplyMatrix(cov, V[_i5]));

            // console.log("After mult cov: ");
            // printEigenvectorsNaN(V,Y,numEigenVectors);

            // console.log("CONVERGE: "+ dotProduct(Y[i], V[i]));
          } while (dotProduct(Y[_i5], V[_i5]) < 1 - epsilon && iteration < maxIterations);

          V[_i5] = Y[_i5];
        }

        //populate the two vectors
        xCoords = multiplyMatrix(pivotDistancesTranspose, V[0]);
        yCoords = multiplyMatrix(pivotDistancesTranspose, V[1]);

        // console.log('xCoords at power iteration: '+ xCoords);
        // console.log('yCoords at power iteration: '+ yCoords);
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

          for (var _i6 = 0; _i6 < nodes.length; _i6++) {
            V1[_i6] = Y1[_i6];
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

        for (var _i7 = 0; _i7 < nodes.length; _i7++) {
          V1[_i7] = Y1[_i7];
        }

        count = 0;
        previous = small;
        while (true) {
          count++;

          for (var _i8 = 0; _i8 < nodes.length; _i8++) {
            V2[_i8] = Y2[_i8];
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

        for (var _i9 = 0; _i9 < nodes.length; _i9++) {
          V2[_i9] = Y2[_i9];
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
      for (var _i10 = 0; _i10 < nodes.length; _i10++) {
        allDistances[_i10] = [];
      }

      // instantiate the array keeping neighborhood of all nodes
      for (var _i11 = 0; _i11 < nodes.length; _i11++) {
        allNodesNeighborhood[_i11] = nodes[_i11].neighborhood().nodes();
      }

      if (options.CMDS) {
        console.log("CMDS");

        runtime = performance.now();
        for (var _i12 = 0; _i12 < totalRuns; _i12++) {
          allBFS();

          // get the distance squared matrix
          for (var _i13 = 0; _i13 < nodes.length; _i13++) {
            for (var j = 0; j < nodes.length; j++) {
              allDistances[_i13][j] *= allDistances[_i13][j];
            }
          }

          powerIterationCMDS();
        }

        runtime = (performance.now() - runtime) / totalRuns;
      } else {
        console.log("HDE");
        runtime = performance.now();

        for (var _i14 = 0; _i14 < totalRuns; _i14++) {
          if (nodes.length < 100) {
            highDimDraw(Math.floor(nodes.length / 2));
          } else {
            highDimDraw(50);
          }

          powerIterationHDE(2);
        }
        runtime = (performance.now() - runtime) / totalRuns;
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

/***/ })
/******/ ]);
});