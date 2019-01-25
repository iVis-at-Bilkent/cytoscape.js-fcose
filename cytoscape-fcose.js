(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("cose-base"), require("numeric"));
	else if(typeof define === 'function' && define.amd)
		define(["cose-base", "numeric"], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeFcose"] = factory(require("cose-base"), require("numeric"));
	else
		root["cytoscapeFcose"] = factory(root["coseBase"], root["numeric"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_6__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(5);

/***/ }),
/* 2 */
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var impl = __webpack_require__(1);

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
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var auxiliary = {};

auxiliary.multMat = function (array1, array2) {
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

auxiliary.multGamma = function (array) {
  var result = [];
  var sum = 0;

  for (var i = 0; i < array.length; i++) {
    sum += array[i];
  }

  sum *= -1 / array.length;

  for (var _i = 0; _i < array.length; _i++) {
    result[_i] = sum + array[_i];
  }
  return result;
};

auxiliary.multL = function (array, C, INV) {
  var result = [];
  var temp1 = [];
  var temp2 = [];

  // multiply by C^T
  for (var i = 0; i < C[0].length; i++) {
    var sum = 0;
    for (var j = 0; j < C.length; j++) {
      sum += -0.5 * C[j][i] * array[j];
    }
    temp1[i] = sum;
  }
  // multiply the result by INV
  for (var _i2 = 0; _i2 < INV.length; _i2++) {
    var _sum = 0;
    for (var _j = 0; _j < INV.length; _j++) {
      _sum += INV[_i2][_j] * temp1[_j];
    }
    temp2[_i2] = _sum;
  }
  // multiply the result by C
  for (var _i3 = 0; _i3 < C.length; _i3++) {
    var _sum2 = 0;
    for (var _j2 = 0; _j2 < C[0].length; _j2++) {
      _sum2 += C[_i3][_j2] * temp2[_j2];
    }
    result[_i3] = _sum2;
  }

  return result;
};

auxiliary.multCons = function (array, constant) {
  var result = [];

  for (var i = 0; i < array.length; i++) {
    result[i] = array[i] * constant;
  }

  return result;
};

// assumes arrays have same size
auxiliary.minusOp = function (array1, array2) {
  var result = [];

  for (var i = 0; i < array1.length; i++) {
    result[i] = array1[i] - array2[i];
  }

  return result;
};

// assumes arrays have same size
auxiliary.dotProduct = function (array1, array2) {
  var product = 0;

  for (var i = 0; i < array1.length; i++) {
    product += array1[i] * array2[i];
  }

  return product;
};

auxiliary.mag = function (array) {
  return Math.sqrt(this.dotProduct(array, array));
};

auxiliary.normalize = function (array) {
  var result = [];
  var magnitude = this.mag(array);

  for (var i = 0; i < array.length; i++) {
    result[i] = array[i] / magnitude;
  }

  return result;
};

module.exports = auxiliary;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// n.b. .layoutPositions() handles all these options for you

var assign = __webpack_require__(2);
var aux = __webpack_require__(4);
var numeric = __webpack_require__(6);
var CoSELayout = __webpack_require__(0).CoSELayout;
var CoSENode = __webpack_require__(0).CoSENode;
var PointD = __webpack_require__(0).layoutBase.PointD;
var DimensionD = __webpack_require__(0).layoutBase.DimensionD;
var LayoutConstants = __webpack_require__(0).layoutBase.LayoutConstants;
var FDLayoutConstants = __webpack_require__(0).layoutBase.FDLayoutConstants;
var CoSEConstants = __webpack_require__(0).CoSEConstants;

var defaults = Object.freeze({

  // CMDS options
  postProcessing: true,
  initialEnergyOnIncremental: 0.2,

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
      var edges = eles.edges();
      var nodeSize = nodes.length;

      var nodeIndexes = new Map(); // map to keep indexes to nodes 
      var parentChildMap = new Map(); // mapping btw. compound and its representative node 
      var allNodesNeighborhood = []; // array to keep neighborhood of all nodes
      var xCoords = [];
      var yCoords = [];

      var samplesColumn = []; // sampled vertices
      var minDistancesColumn = [];
      var C = []; // column sampling matrix
      var PHI = []; // intersection of column and row sampling matrices 
      var INV = []; // inverse of PHI 

      var firstSample = void 0; // the first sampled node

      var infinity = 100000000;
      var small = 0.000000001;
      var piTol = 0.0000001;
      var sampling = options.sampling;
      var sampleSize = 25;
      var samplingType = 1; // 0 for random, 1 for greedy

      // determine which columns(or rows) to be sampled
      var randomSampleCR = function randomSampleCR() {
        var sample = 0;
        var count = 0;
        var flag = false;

        while (count < sampleSize) {
          sample = Math.floor(Math.random() * nodeSize);

          flag = false;
          for (var _i = 0; _i < count; _i++) {
            if (samplesColumn[_i] == sample) {
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
        var path = []; // the front of the path
        var front = 0; // the back of the path
        var back = 0;
        var current = 0;
        var temp = void 0;
        var distance = [];

        var max_dist = 0; // the furthest node to be returned
        var max_ind = 1;

        for (var _i2 = 0; _i2 < nodeSize; _i2++) {
          distance[_i2] = infinity;
        }

        path[back] = pivot;
        distance[pivot] = 0;

        while (back >= front) {
          current = path[front++];
          var neighbors = allNodesNeighborhood[current];
          for (var _i3 = 0; _i3 < neighbors.length; _i3++) {
            temp = nodeIndexes.get(neighbors[_i3].id());
            if (distance[temp] == infinity) {
              distance[temp] = distance[current] + 1;
              path[++back] = temp;
            }
          }
          C[current][index] = distance[current] * 75;
        }

        if (samplingMethod == 1) {
          for (var _i4 = 0; _i4 < nodeSize; _i4++) {
            if (C[_i4][index] < minDistancesColumn[_i4]) minDistancesColumn[_i4] = C[_i4][index];
          }

          for (var _i5 = 0; _i5 < nodeSize; _i5++) {
            if (minDistancesColumn[_i5] > max_dist) {
              max_dist = minDistancesColumn[_i5];
              max_ind = _i5;
            }
          }
        }
        return max_ind;
      };

      //  apply BFS to all nodes or selected samples
      var allBFS = function allBFS(samplingMethod) {

        var sample = void 0;

        if (samplingMethod == 0) {
          randomSampleCR();

          // call BFS
          for (var _i6 = 0; _i6 < sampleSize; _i6++) {
            BFS(samplesColumn[_i6], _i6, samplingMethod, false);
          }
        } else {
          sample = Math.floor(Math.random() * nodeSize);
          firstSample = sample;

          for (var _i7 = 0; _i7 < nodeSize; _i7++) {
            minDistancesColumn[_i7] = infinity;
          }

          for (var _i8 = 0; _i8 < sampleSize; _i8++) {
            samplesColumn[_i8] = sample;
            sample = BFS(sample, _i8, samplingMethod);
          }
        }

        // form the squared distances for C
        for (var _i9 = 0; _i9 < nodeSize; _i9++) {
          for (var j = 0; j < sampleSize; j++) {
            C[_i9][j] *= C[_i9][j];
          }
        }

        // form PHI
        for (var _i10 = 0; _i10 < sampleSize; _i10++) {
          PHI[_i10] = [];
        }

        for (var _i11 = 0; _i11 < sampleSize; _i11++) {
          for (var _j = 0; _j < sampleSize; _j++) {
            PHI[_i11][_j] = C[samplesColumn[_j]][_i11];
          }
        }
      };

      // perform the SVD algorithm and apply a regularization step)
      var sample = function sample() {

        var SVDResult = numeric.svd(PHI);

        var a_w = SVDResult.S;
        var a_u = SVDResult.U;
        var a_v = SVDResult.V;

        var max_s = a_w[0] * a_w[0] * a_w[0];

        var a_Sig = [];

        //  regularization
        for (var _i12 = 0; _i12 < sampleSize; _i12++) {
          a_Sig[_i12] = [];
          for (var j = 0; j < sampleSize; j++) {
            a_Sig[_i12][j] = 0;
            if (_i12 == j) {
              a_Sig[_i12][j] = a_w[_i12] / (a_w[_i12] * a_w[_i12] + max_s / (a_w[_i12] * a_w[_i12]));
            }
          }
        }

        INV = aux.multMat(aux.multMat(a_v, a_Sig), numeric.transpose(a_u));
      };

      var powerIteration = function powerIteration() {
        // two largest eigenvalues
        var theta1 = void 0;
        var theta2 = void 0;

        // initial guesses for eigenvectors
        var Y1 = [];
        var Y2 = [];

        var V1 = [];
        var V2 = [];

        for (var _i13 = 0; _i13 < nodeSize; _i13++) {
          Y1[_i13] = Math.random();
          Y2[_i13] = Math.random();
        }

        Y1 = aux.normalize(Y1);
        Y2 = aux.normalize(Y2);

        var count = 0;
        // to keep track of the improvement ratio in power iteration
        var current = small;
        var previous = small;

        var temp = void 0;

        while (true) {
          count++;

          for (var _i14 = 0; _i14 < nodeSize; _i14++) {
            V1[_i14] = Y1[_i14];
          }

          Y1 = aux.multGamma(aux.multL(aux.multGamma(V1), C, INV));
          theta1 = aux.dotProduct(V1, Y1);
          Y1 = aux.normalize(Y1);

          current = aux.dotProduct(V1, Y1);

          temp = Math.abs(current / previous);

          if (temp < 1 + piTol && temp > 1) {
            break;
          }

          previous = current;
        }

        for (var _i15 = 0; _i15 < nodeSize; _i15++) {
          V1[_i15] = Y1[_i15];
        }

        count = 0;
        previous = small;
        while (true) {
          count++;

          for (var _i16 = 0; _i16 < nodeSize; _i16++) {
            V2[_i16] = Y2[_i16];
          }

          V2 = aux.minusOp(V2, aux.multCons(V1, aux.dotProduct(V1, V2)));
          Y2 = aux.multGamma(aux.multL(aux.multGamma(V2), C, INV));
          theta2 = aux.dotProduct(V2, Y2);
          Y2 = aux.normalize(Y2);

          current = aux.dotProduct(V2, Y2);

          temp = Math.abs(current / previous);

          if (temp < 1 + piTol && temp > 1) {
            break;
          }

          previous = current;
        }

        for (var _i17 = 0; _i17 < nodeSize; _i17++) {
          V2[_i17] = Y2[_i17];
        }

        // theta1 now contains dominant eigenvalue
        // theta2 now contains the second-largest eigenvalue
        // V1 now contains theta1's eigenvector
        // V2 now contains theta2's eigenvector

        //populate the two vectors
        xCoords = aux.multCons(V1, Math.sqrt(Math.abs(theta1)));
        yCoords = aux.multCons(V2, Math.sqrt(Math.abs(theta2)));
      };

      //  form a parent-child map to keep representative node of each compound node  
      cy.nodes(":parent").forEach(function (ele) {
        var children = ele.children();

        var random = 0;
        while (children.nodes(":childless").length == 0) {
          random = Math.floor(Math.random() * children.nodes().length); // if all children are compound then proceed randomly
          children = children.nodes()[0].children();
        }
        //  select the representative node - we can apply different methods here
        //      random = Math.floor(Math.random() * children.nodes(":childless").length);
        var index = 0;
        var min = 1000;
        children.nodes(":childless").forEach(function (ele2, i) {
          if (ele2.connectedEdges().length < min) {
            min = ele2.connectedEdges().length;
            index = i;
          }
        });
        parentChildMap.set(ele.id(), children.nodes(":childless")[index]);
      });

      // assign indexes to nodes
      var index = 0;
      for (var _i18 = 0; _i18 < nodes.length; _i18++) {
        if (!nodes[_i18].isParent()) {
          nodeIndexes.set(nodes[_i18].id(), index);
          allNodesNeighborhood[index++] = nodes[_i18].neighborhood().nodes().not(":parent"); //  form neighborhood for simple nodes
        }
      }

      // add neighborhood relations of compound nodes
      cy.nodes(":parent").forEach(function (ele) {
        //  first add neighbors to representative node
        allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele.id()).id())] = allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele.id()).id())].union(ele.neighborhood().nodes().not(":parent"));
        ele.neighborhood().nodes(":parent").forEach(function (ele2, i) {
          allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele.id()).id())] = allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele.id()).id())].union(parentChildMap.get(ele2.id()));
        });
        //  then add representative node to neighbors
        ele.neighborhood().nodes().not(":parent").forEach(function (ele3, i) {
          allNodesNeighborhood[nodeIndexes.get(ele3.id())] = allNodesNeighborhood[nodeIndexes.get(ele3.id())].union(parentChildMap.get(ele.id()));
        });
        ele.neighborhood().nodes(":parent").forEach(function (ele3, i) {
          allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele3.id()).id())] = allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele3.id()).id())].union(parentChildMap.get(ele.id()));
        });
      });

      //  nodeSize now only considers the size of transformed graph
      nodeSize = nodeIndexes.size;

      // instantiates the partial matrices
      for (var _i19 = 0; _i19 < nodeSize; _i19++) {
        C[_i19] = [];
      }
      for (var _i20 = 0; _i20 < sampleSize; _i20++) {
        INV[_i20] = [];
      }

      var spectral = performance.now();

      allBFS(samplingType);

      sample();

      powerIteration();

      spectral = performance.now() - spectral;

      var getTopMostNodes = function getTopMostNodes(nodes) {
        var nodesMap = {};
        for (var i = 0; i < nodes.length; i++) {
          nodesMap[nodes[i].id()] = true;
        }
        var roots = nodes.filter(function (ele, i) {
          if (typeof ele === "number") {
            ele = i;
          }
          var parent = ele.parent()[0];
          while (parent != null) {
            if (nodesMap[parent.id()]) {
              return false;
            }
            parent = parent.parent()[0];
          }
          return true;
        });

        return roots;
      };

      var processChildrenList = function processChildrenList(parent, children, layout) {
        var size = children.length;
        for (var i = 0; i < size; i++) {
          var theChild = children[i];
          var children_of_children = theChild.children();
          var theNode;

          var dimensions = theChild.layoutDimensions({
            nodeDimensionsIncludeLabels: options.nodeDimensionsIncludeLabels
          });

          if (theChild.outerWidth() != null && theChild.outerHeight() != null) {
            if (!theChild.isParent()) {
              theNode = parent.add(new CoSENode(layout.graphManager, new PointD(xCoords[nodeIndexes.get(theChild.id())] - dimensions.w / 2, yCoords[nodeIndexes.get(theChild.id())] - dimensions.h / 2), new DimensionD(parseFloat(dimensions.w), parseFloat(dimensions.h))));
            } else {
              theNode = parent.add(new CoSENode(layout.graphManager, new PointD(theChild.boundingBox().x1, theChild.boundingBox().y1), new DimensionD(parseFloat(dimensions.w), parseFloat(dimensions.h))));
            }
          } else {
            theNode = parent.add(new CoSENode(this.graphManager));
          }
          // Attach id to the layout node
          theNode.id = theChild.data("id");
          // Attach the paddings of cy node to layout node
          theNode.paddingLeft = parseInt(theChild.css('padding'));
          theNode.paddingTop = parseInt(theChild.css('padding'));
          theNode.paddingRight = parseInt(theChild.css('padding'));
          theNode.paddingBottom = parseInt(theChild.css('padding'));

          //Attach the label properties to compound if labels will be included in node dimensions  
          if (options.nodeDimensionsIncludeLabels) {
            if (theChild.isParent()) {
              var labelWidth = theChild.boundingBox({ includeLabels: true, includeNodes: false }).w;
              var labelHeight = theChild.boundingBox({ includeLabels: true, includeNodes: false }).h;
              var labelPos = theChild.css("text-halign");
              theNode.labelWidth = labelWidth;
              theNode.labelHeight = labelHeight;
              theNode.labelPos = labelPos;
            }
          }

          // Map the layout node
          idToLNode[theChild.data("id")] = theNode;

          if (isNaN(theNode.rect.x)) {
            theNode.rect.x = 0;
          }

          if (isNaN(theNode.rect.y)) {
            theNode.rect.y = 0;
          }

          if (children_of_children != null && children_of_children.length > 0) {
            var theNewGraph;
            theNewGraph = layout.getGraphManager().add(layout.newGraph(), theNode);
            processChildrenList(theNewGraph, children_of_children, layout);
          }
        }
      };

      //  transfer calculated positions to nodes (positions of only simple nodes are calculated)
      var getPositions = function getPositions(ele, i) {
        if (options.postProcessing) {
          if (typeof ele === "number") {
            ele = i;
          }
          var theId = ele.data('id');
          var lNode = idToLNode[theId];

          return {
            x: lNode.getRect().getCenterX(),
            y: lNode.getRect().getCenterY()
          };
        } else {
          return {
            x: xCoords[i],
            y: yCoords[i]
          };
        }
      };

      var cose = performance.now();

      var idToLNode = {};
      var coseLayout = new CoSELayout();
      var gm = coseLayout.newGraphManager();

      CoSEConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL = options.initialEnergyOnIncremental;
      CoSEConstants.DEFAULT_INCREMENTAL = FDLayoutConstants.DEFAULT_INCREMENTAL = LayoutConstants.DEFAULT_INCREMENTAL = true;

      if (options.postProcessing) {

        processChildrenList(gm.addRoot(), getTopMostNodes(nodes), coseLayout);

        for (var i = 0; i < edges.length; i++) {
          var edge = edges[i];
          var sourceNode = idToLNode[edge.data("source")];
          var targetNode = idToLNode[edge.data("target")];
          if (sourceNode !== targetNode && sourceNode.getEdgesBetween(targetNode).length == 0) {
            var e1 = gm.add(coseLayout.newEdge(), sourceNode, targetNode);
            e1.id = edge.id();
          }
        }

        coseLayout.runLayout();
      }

      cose = performance.now() - cose;

      nodes.not(":parent").layoutPositions(layout, options, getPositions);

      //  transfer calculated positions to nodes (positions of only simple nodes are calculated)
      //    let getPositions = function(ele, i ){
      //      if(options.postProcessing) {
      //        cy.nodes().not(":parent").positions(function( node, i ){
      //          return {
      //            x: xCoords[i],
      //            y: yCoords[i]
      //          };
      //        });
      //      }
      //      else{
      //        return {
      //          x: xCoords[i],
      //          y: yCoords[i]
      //        };
      //      }
      //    };

      //    if(options.postProcessing){
      //      getPositions();
      //      var cose = performance.now();
      //      var coseLayout = cy.layout({
      //        name: "cose-bilkent",
      //        randomize: false,
      //        initialEnergyOnIncremental: options.initialEnergyOnIncremental
      //      });
      //
      //      coseLayout.run();
      //      cose = performance.now() - cose;
      //    }
      //    else{
      //      // .layoutPositions() automatically handles the layout busywork for you
      //      nodes.not(":parent").layoutPositions( layout, options, getPositions );
      //    }

      document.getElementById("spectral").innerHTML = Math.floor(spectral) + " ms";
      if (options.postProcessing) {
        document.getElementById("cose").innerHTML = Math.floor(cose) + " ms";
        document.getElementById("total").innerHTML = Math.floor(spectral + cose) + " ms";
      } else {
        document.getElementById("cose").innerHTML = "N/A";
        document.getElementById("total").innerHTML = Math.floor(spectral) + " ms";
      }
    }
  }]);

  return Layout;
}();

module.exports = Layout;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ })
/******/ ]);
});