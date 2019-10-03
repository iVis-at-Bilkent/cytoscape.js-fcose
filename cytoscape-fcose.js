(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("cose-base"), require("numeric"));
	else if(typeof define === 'function' && define.amd)
		define(["cose-base", "numeric"], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeFcose"] = factory(require("cose-base"), require("numeric"));
	else
		root["cytoscapeFcose"] = factory(root["coseBase"], root["numeric"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_7__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
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


/*
 * Auxiliary functions
 */

var LinkedList = __webpack_require__(0).layoutBase.LinkedList;

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

// get the top most nodes
auxiliary.getTopMostNodes = function (nodes) {
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

// find disconnected components and create dummy nodes that connect them
auxiliary.connectComponents = function (cy, eles, topMostNodes, dummyNodes) {
  var queue = new LinkedList();
  var visited = new Set();
  var visitedTopMostNodes = [];
  var currentNeighbor = void 0;
  var minDegreeNode = void 0;
  var minDegree = void 0;

  var isConnected = false;
  var count = 1;
  var nodesConnectedToDummy = [];
  var components = [];

  var _loop = function _loop() {
    var cmpt = cy.collection();
    components.push(cmpt);

    var currentNode = topMostNodes[0];
    var childrenOfCurrentNode = cy.collection();
    childrenOfCurrentNode.merge(currentNode).merge(currentNode.descendants());
    visitedTopMostNodes.push(currentNode);

    childrenOfCurrentNode.forEach(function (node) {
      queue.push(node);
      visited.add(node);
      cmpt.merge(node);
    });

    var _loop2 = function _loop2() {
      currentNode = queue.shift();

      // Traverse all neighbors of this node
      var neighborNodes = cy.collection();
      currentNode.neighborhood().nodes().forEach(function (node) {
        if (eles.contains(currentNode.edgesWith(node))) {
          neighborNodes.merge(node);
        }
      });

      for (var i = 0; i < neighborNodes.length; i++) {
        var neighborNode = neighborNodes[i];
        currentNeighbor = topMostNodes.intersection(neighborNode.union(neighborNode.ancestors()));
        if (currentNeighbor != null && !visited.has(currentNeighbor[0])) {
          var childrenOfNeighbor = currentNeighbor.union(currentNeighbor.descendants());

          childrenOfNeighbor.forEach(function (node) {
            queue.push(node);
            visited.add(node);
            cmpt.merge(node);
            if (topMostNodes.has(node)) {
              visitedTopMostNodes.push(node);
            }
          });
        }
      }
    };

    while (queue.length != 0) {
      _loop2();
    }

    cmpt.forEach(function (node) {
      node.connectedEdges().forEach(function (e) {
        // connectedEdges() usually cached
        if (cmpt.has(e.source()) && cmpt.has(e.target())) {
          // has() is cheap
          cmpt.merge(e); // forEach() only considers nodes -- sets N at call time
        }
      });
    });

    if (visitedTopMostNodes.length == topMostNodes.length) {
      isConnected = true;
    }

    if (!isConnected || isConnected && count > 1) {
      minDegreeNode = visitedTopMostNodes[0];
      minDegree = minDegreeNode.connectedEdges().length;
      visitedTopMostNodes.forEach(function (node) {
        if (node.connectedEdges().length < minDegree) {
          minDegree = node.connectedEdges().length;
          minDegreeNode = node;
        }
      });
      nodesConnectedToDummy.push(minDegreeNode.id());
      // TO DO: Check efficiency of this part
      var temp = cy.collection();
      temp.merge(visitedTopMostNodes[0]);
      visitedTopMostNodes.forEach(function (node) {
        temp.merge(node);
      });
      visitedTopMostNodes = [];
      topMostNodes = topMostNodes.difference(temp);
      count++;
    }
  };

  do {
    _loop();
  } while (!isConnected);

  if (dummyNodes) {
    if (nodesConnectedToDummy.length > 0) {
      dummyNodes.set('dummy' + (dummyNodes.size + 1), nodesConnectedToDummy);
    }
  }
  return components;
};

auxiliary.calcBoundingBox = function (parentNode, xCoords, yCoords, nodeIndexes) {
  // calculate bounds
  var left = Number.MAX_VALUE;
  var right = Number.MIN_VALUE;
  var top = Number.MAX_VALUE;
  var bottom = Number.MIN_VALUE;
  var nodeLeft = void 0;
  var nodeRight = void 0;
  var nodeTop = void 0;
  var nodeBottom = void 0;

  var nodes = parentNode.descendants().not(":parent");
  var s = nodes.length;
  for (var i = 0; i < s; i++) {
    var node = nodes[i];

    nodeLeft = xCoords[nodeIndexes.get(node.id())] - node.width() / 2;
    nodeRight = xCoords[nodeIndexes.get(node.id())] + node.width() / 2;
    nodeTop = yCoords[nodeIndexes.get(node.id())] - node.height() / 2;
    nodeBottom = yCoords[nodeIndexes.get(node.id())] + node.height() / 2;

    if (left > nodeLeft) {
      left = nodeLeft;
    }

    if (right < nodeRight) {
      right = nodeRight;
    }

    if (top > nodeTop) {
      top = nodeTop;
    }

    if (bottom < nodeBottom) {
      bottom = nodeBottom;
    }
  }

  var boundingBox = {};
  boundingBox.topLeftX = left;
  boundingBox.topLeftY = top;
  boundingBox.width = right - left;
  boundingBox.height = bottom - top;
  return boundingBox;
};

module.exports = auxiliary;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
  The implementation of the fcose layout algorithm
*/

var assign = __webpack_require__(3);
var aux = __webpack_require__(1);

var _require = __webpack_require__(5),
    spectralLayout = _require.spectralLayout;

var _require2 = __webpack_require__(4),
    coseLayout = _require2.coseLayout;

var defaults = Object.freeze({

  // 'draft', 'default' or 'proof' 
  // - 'draft' only applies spectral layout 
  // - 'default' improves the quality with subsequent CoSE layout (fast cooling rate)
  // - 'proof' improves the quality with subsequent CoSE layout (slow cooling rate) 
  quality: "default",
  // use random node positions at beginning of layout
  // if this is set to false, then quality option must be "proof"
  randomize: true,
  // whether or not to animate the layout
  animate: true,
  // duration of animation in ms, if enabled
  animationDuration: 1000,
  // easing of animation, if enabled
  animationEasing: undefined,
  // fit the viewport to the repositioned nodes
  fit: true,
  // padding around layout
  padding: 10,
  // whether to include labels in node dimensions. Valid in "proof" quality
  nodeDimensionsIncludeLabels: false,
  // whether to pack disconnected components - valid only if randomize: true
  packComponents: true,

  /* spectral layout options */

  // false for random, true for greedy
  samplingType: true,
  // sample size to construct distance matrix
  sampleSize: 25,
  // separation amount between nodes
  nodeSeparation: 75,
  // power iteration tolerance
  piTol: 0.0000001,

  /* CoSE layout options */

  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 4500,
  // Ideal edge (non nested) length
  idealEdgeLength: 50,
  // Divisor to compute edge forces
  edgeElasticity: 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 0.1,
  // Gravity force (constant)
  gravity: 0.25,
  // Maximum number of iterations to perform
  numIter: 2500,
  // For enabling tiling
  tile: true,
  // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingVertical: 10,
  // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8,
  // Initial cooling factor for incremental layout  
  initialEnergyOnIncremental: 0.3,

  /* layout event callbacks */
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

      var spectralResult = [];
      var xCoords = void 0;
      var yCoords = void 0;
      var coseResult = [];
      var components = void 0;

      var layUtil = void 0;
      var packingEnabled = false;
      if (cy.layoutUtilities && options.packComponents && options.randomize) {
        layUtil = cy.layoutUtilities("get");
        if (!layUtil) layUtil = cy.layoutUtilities();
        packingEnabled = true;
      }

      if (options.eles.length == 0) return;

      if (options.eles.length != options.cy.elements().length) {
        var prevNodes = eles.nodes();
        eles = eles.union(eles.descendants());

        eles.forEach(function (ele) {
          if (ele.isNode()) {
            var connectedEdges = ele.connectedEdges();
            connectedEdges.forEach(function (edge) {
              if (eles.contains(edge.source()) && eles.contains(edge.target()) && !prevNodes.contains(edge.source().union(edge.target()))) {
                eles = eles.union(edge);
              }
            });
          }
        });

        options.eles = eles;
      }

      if (packingEnabled) {
        var topMostNodes = aux.getTopMostNodes(options.eles.nodes());
        components = aux.connectComponents(cy, options.eles, topMostNodes);
      }

      if (options.randomize) {
        if (packingEnabled) {
          components.forEach(function (component) {
            options.eles = component;
            spectralResult.push(spectralLayout(options));
          });
        } else {
          // Apply spectral layout
          spectralResult.push(spectralLayout(options));
          if (spectralResult[0]) {
            xCoords = spectralResult[0]["xCoords"];
            yCoords = spectralResult[0]["yCoords"];
          }
        }
      }

      if (options.quality == "default" || options.quality == "proof" || spectralResult.includes(false)) {
        if (packingEnabled) {
          if (options.quality == "draft" && spectralResult.includes(false)) {
            spectralResult.forEach(function (value, index) {
              if (!value) {
                options.eles = components[index];
                var tempResult = coseLayout(options, spectralResult[index]);
                var nodeIndexes = new Map();
                var _xCoords = [];
                var _yCoords = [];
                var count = 0;
                Object.keys(tempResult).forEach(function (item) {
                  nodeIndexes.set(item, count++);
                  _xCoords.push(tempResult[item].getCenterX());
                  _yCoords.push(tempResult[item].getCenterY());
                });
                spectralResult[index] = { nodeIndexes: nodeIndexes, xCoords: _xCoords, yCoords: _yCoords };
              }
            });
          } else {
            var toBeTiledNodes = cy.collection();
            if (options.tile) {
              var nodeIndexes = new Map();
              var _xCoords2 = [];
              var _yCoords2 = [];
              var count = 0;
              var tempSpectralResult = { nodeIndexes: nodeIndexes, xCoords: _xCoords2, yCoords: _yCoords2 };
              var indexesToBeDeleted = [];
              components.forEach(function (component, index) {
                if (component.edges().length == 0) {
                  component.nodes().forEach(function (node, i) {
                    toBeTiledNodes.merge(component.nodes()[i]);
                    if (!node.isParent()) {
                      tempSpectralResult.nodeIndexes.set(component.nodes()[i].id(), count++);
                      tempSpectralResult.xCoords.push(component.nodes()[0].position().x);
                      tempSpectralResult.yCoords.push(component.nodes()[0].position().y);
                    }
                  });
                  indexesToBeDeleted.push(index);
                }
              });
              if (toBeTiledNodes.length > 1) {
                components.push(toBeTiledNodes);
                for (var i = indexesToBeDeleted.length - 1; i >= 0; i--) {
                  components.splice(indexesToBeDeleted[i], 1);
                  spectralResult.splice(indexesToBeDeleted[i], 1);
                };
                spectralResult.push(tempSpectralResult);
              }
            }
            components.forEach(function (component, index) {
              options.eles = component;
              coseResult.push(coseLayout(options, spectralResult[index]));
            });
          }
        } else {
          // Apply cose layout as postprocessing
          coseResult.push(coseLayout(options, spectralResult[0]));
        }
      }

      if (packingEnabled) {
        var subgraphs = [];
        components.forEach(function (component, index) {
          var nodeIndexes = void 0;
          if (options.quality == "draft") {
            nodeIndexes = spectralResult[index].nodeIndexes;
          }
          var subgraph = {};
          subgraph.nodes = [];
          subgraph.edges = [];
          var nodeIndex = void 0;
          component.nodes().forEach(function (node) {
            if (options.quality == "draft") {
              if (!node.isParent()) {
                nodeIndex = nodeIndexes.get(node.id());
                subgraph.nodes.push({ x: spectralResult[index].xCoords[nodeIndex] - node.bb().w / 2, y: spectralResult[index].yCoords[nodeIndex] - node.bb().h / 2, width: node.bb().w, height: node.bb().h });
              } else {
                var parentInfo = aux.calcBoundingBox(node, spectralResult[index].xCoords, spectralResult[index].yCoords, nodeIndexes);
                subgraph.nodes.push({ x: parentInfo.topLeftX, y: parentInfo.topLeftY, width: parentInfo.width, height: parentInfo.height });
              }
            } else {
              subgraph.nodes.push({ x: coseResult[index][node.id()].getLeft(), y: coseResult[index][node.id()].getTop(), width: coseResult[index][node.id()].getWidth(), height: coseResult[index][node.id()].getHeight() });
            }
          });
          subgraphs.push(subgraph);
        });
        var shiftResult = layUtil.packComponents(subgraphs).shifts;
        if (options.quality == "draft") {
          spectralResult.forEach(function (result, index) {
            var newXCoords = result.xCoords.map(function (x) {
              return x + shiftResult[index].dx;
            });
            var newYCoords = result.yCoords.map(function (y) {
              return y + shiftResult[index].dy;
            });
            result.xCoords = newXCoords;
            result.yCoords = newYCoords;
          });
        } else {
          coseResult.forEach(function (result, index) {
            Object.keys(result).forEach(function (item) {
              var nodeRectangle = result[item];
              nodeRectangle.setCenter(nodeRectangle.getCenterX() + shiftResult[index].dx, nodeRectangle.getCenterY() + shiftResult[index].dy);
            });
          });
        }
      }

      // get each element's calculated position
      var getPositions = function getPositions(ele, i) {
        if (options.quality == "default" || options.quality == "proof" || options.quality == "proof" && !packingEnabled && spectralResult.includes(false)) {
          if (typeof ele === "number") {
            ele = i;
          }
          var pos = void 0;
          var theId = ele.data('id');
          coseResult.forEach(function (result) {
            if (theId in result) {
              pos = { x: result[theId].getRect().getCenterX(), y: result[theId].getRect().getCenterY() };
            }
          });
          return {
            x: pos.x,
            y: pos.y
          };
        } else {
          var _pos = void 0;
          spectralResult.forEach(function (result) {
            var index = result.nodeIndexes.get(ele.id());
            if (index != undefined) {
              _pos = { x: result.xCoords[index], y: result.yCoords[index] };
            };
          });
          return {
            x: _pos.x,
            y: _pos.y
          };
        }
      };

      // quality = "draft" and randomize = false are contradictive so in that case positions don't change
      if (options.quality == "default" || options.quality == "proof" || options.randomize) {
        // transfer calculated positions to nodes (positions of only simple nodes are evaluated, compounds are positioned automatically)
        options.eles = eles;
        eles.nodes().not(":parent").layoutPositions(layout, options, getPositions);
      } else {
        console.log("If randomize option is set to false, then quality option must be 'default' or 'proof'.");
      }
    }
  }]);

  return Layout;
}();

module.exports = Layout;

/***/ }),
/* 3 */
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
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
  The implementation of the postprocessing part that applies CoSE layout over the spectral layout
*/

var aux = __webpack_require__(1);
var CoSELayout = __webpack_require__(0).CoSELayout;
var CoSENode = __webpack_require__(0).CoSENode;
var PointD = __webpack_require__(0).layoutBase.PointD;
var DimensionD = __webpack_require__(0).layoutBase.DimensionD;
var LayoutConstants = __webpack_require__(0).layoutBase.LayoutConstants;
var FDLayoutConstants = __webpack_require__(0).layoutBase.FDLayoutConstants;
var CoSEConstants = __webpack_require__(0).CoSEConstants;

// main function that cose layout is processed
var coseLayout = function coseLayout(options, spectralResult) {

  var eles = options.eles;
  var nodes = eles.nodes();
  var edges = eles.edges();

  var nodeIndexes = void 0;
  var xCoords = void 0;
  var yCoords = void 0;
  var idToLNode = {};

  if (options.randomize && spectralResult) {
    nodeIndexes = spectralResult["nodeIndexes"];
    xCoords = spectralResult["xCoords"];
    yCoords = spectralResult["yCoords"];
  }

  /**** Postprocessing functions ****/

  // transfer cytoscape nodes to cose nodes
  var processChildrenList = function processChildrenList(parent, children, layout, options) {
    var size = children.length;
    for (var i = 0; i < size; i++) {
      var theChild = children[i];
      var children_of_children = theChild.children();
      var theNode = void 0;

      var dimensions = theChild.layoutDimensions({
        nodeDimensionsIncludeLabels: options.nodeDimensionsIncludeLabels
      });

      if (theChild.outerWidth() != null && theChild.outerHeight() != null) {
        if (options.randomize && spectralResult) {
          if (!theChild.isParent()) {
            theNode = parent.add(new CoSENode(layout.graphManager, new PointD(xCoords[nodeIndexes.get(theChild.id())] - dimensions.w / 2, yCoords[nodeIndexes.get(theChild.id())] - dimensions.h / 2), new DimensionD(parseFloat(dimensions.w), parseFloat(dimensions.h))));
          } else {
            var parentInfo = aux.calcBoundingBox(theChild, xCoords, yCoords, nodeIndexes);
            theNode = parent.add(new CoSENode(layout.graphManager, new PointD(parentInfo.topLeftX, parentInfo.topLeftY), new DimensionD(parentInfo.width, parentInfo.height)));
          }
        } else {
          theNode = parent.add(new CoSENode(layout.graphManager, new PointD(theChild.position('x') - dimensions.w / 2, theChild.position('y') - dimensions.h / 2), new DimensionD(parseFloat(dimensions.w), parseFloat(dimensions.h))));
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
        var theNewGraph = void 0;
        theNewGraph = layout.getGraphManager().add(layout.newGraph(), theNode);
        processChildrenList(theNewGraph, children_of_children, layout, options);
      }
    }
  };

  // transfer cytoscape edges to cose edges
  var processEdges = function processEdges(layout, gm, edges) {
    for (var i = 0; i < edges.length; i++) {
      var edge = edges[i];
      var sourceNode = idToLNode[edge.data("source")];
      var targetNode = idToLNode[edge.data("target")];
      if (sourceNode !== targetNode && sourceNode.getEdgesBetween(targetNode).length == 0) {
        var e1 = gm.add(layout.newEdge(), sourceNode, targetNode);
        e1.id = edge.id();
      }
    }
  };

  /**** Apply postprocessing ****/

  if (options.nodeRepulsion != null) CoSEConstants.DEFAULT_REPULSION_STRENGTH = FDLayoutConstants.DEFAULT_REPULSION_STRENGTH = options.nodeRepulsion;
  if (options.idealEdgeLength != null) CoSEConstants.DEFAULT_EDGE_LENGTH = FDLayoutConstants.DEFAULT_EDGE_LENGTH = options.idealEdgeLength;
  if (options.edgeElasticity != null) CoSEConstants.DEFAULT_SPRING_STRENGTH = FDLayoutConstants.DEFAULT_SPRING_STRENGTH = options.edgeElasticity;
  if (options.nestingFactor != null) CoSEConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = options.nestingFactor;
  if (options.gravity != null) CoSEConstants.DEFAULT_GRAVITY_STRENGTH = FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH = options.gravity;
  if (options.numIter != null) CoSEConstants.MAX_ITERATIONS = FDLayoutConstants.MAX_ITERATIONS = options.numIter;
  if (options.gravityRange != null) CoSEConstants.DEFAULT_GRAVITY_RANGE_FACTOR = FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR = options.gravityRange;
  if (options.gravityCompound != null) CoSEConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH = options.gravityCompound;
  if (options.gravityRangeCompound != null) CoSEConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = options.gravityRangeCompound;
  if (options.initialEnergyOnIncremental != null) CoSEConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL = options.initialEnergyOnIncremental;

  if (options.quality == 'proof') LayoutConstants.QUALITY = 2;else LayoutConstants.QUALITY = 0;

  CoSEConstants.NODE_DIMENSIONS_INCLUDE_LABELS = FDLayoutConstants.NODE_DIMENSIONS_INCLUDE_LABELS = LayoutConstants.NODE_DIMENSIONS_INCLUDE_LABELS = options.nodeDimensionsIncludeLabels;
  CoSEConstants.DEFAULT_INCREMENTAL = FDLayoutConstants.DEFAULT_INCREMENTAL = LayoutConstants.DEFAULT_INCREMENTAL = !options.randomize;
  CoSEConstants.ANIMATE = FDLayoutConstants.ANIMATE = LayoutConstants.ANIMATE = options.animate;
  CoSEConstants.TILE = options.tile;
  CoSEConstants.TILING_PADDING_VERTICAL = typeof options.tilingPaddingVertical === 'function' ? options.tilingPaddingVertical.call() : options.tilingPaddingVertical;
  CoSEConstants.TILING_PADDING_HORIZONTAL = typeof options.tilingPaddingHorizontal === 'function' ? options.tilingPaddingHorizontal.call() : options.tilingPaddingHorizontal;

  CoSEConstants.DEFAULT_INCREMENTAL = FDLayoutConstants.DEFAULT_INCREMENTAL = LayoutConstants.DEFAULT_INCREMENTAL = true;

  var coseLayout = new CoSELayout();
  var gm = coseLayout.newGraphManager();

  processChildrenList(gm.addRoot(), aux.getTopMostNodes(nodes), coseLayout, options);

  processEdges(coseLayout, gm, edges);

  coseLayout.runLayout();

  return idToLNode;
};

module.exports = { coseLayout: coseLayout };

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
  The implementation of the spectral layout that is the first part of the fcose layout algorithm
*/

var aux = __webpack_require__(1);
var numeric = __webpack_require__(7);

// main function that spectral layout is processed
var spectralLayout = function spectralLayout(options) {

  var cy = options.cy;
  var eles = options.eles;
  var nodes = eles.nodes();
  var parentNodes = eles.nodes(":parent");

  var dummyNodes = new Map(); // map to keep dummy nodes and their neighbors
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
  var nodeSize = void 0;

  var infinity = 100000000;
  var small = 0.000000001;

  var piTol = options.piTol;
  var samplingType = options.samplingType; // false for random, true for greedy
  var nodeSeparation = options.nodeSeparation;
  var sampleSize = void 0;

  /**** Spectral-preprocessing functions ****/

  /**** Spectral layout functions ****/

  // determine which columns to be sampled
  var randomSampleCR = function randomSampleCR() {
    var sample = 0;
    var count = 0;
    var flag = false;

    while (count < sampleSize) {
      sample = Math.floor(Math.random() * nodeSize);

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
    var path = []; // the front of the path
    var front = 0; // the back of the path
    var back = 0;
    var current = 0;
    var temp = void 0;
    var distance = [];

    var max_dist = 0; // the furthest node to be returned
    var max_ind = 1;

    for (var i = 0; i < nodeSize; i++) {
      distance[i] = infinity;
    }

    path[back] = pivot;
    distance[pivot] = 0;

    while (back >= front) {
      current = path[front++];
      var neighbors = allNodesNeighborhood[current];
      for (var _i = 0; _i < neighbors.length; _i++) {
        temp = nodeIndexes.get(neighbors[_i]);
        if (distance[temp] == infinity) {
          distance[temp] = distance[current] + 1;
          path[++back] = temp;
        }
      }
      C[current][index] = distance[current] * nodeSeparation;
    }

    if (samplingMethod) {
      for (var _i2 = 0; _i2 < nodeSize; _i2++) {
        if (C[_i2][index] < minDistancesColumn[_i2]) minDistancesColumn[_i2] = C[_i2][index];
      }

      for (var _i3 = 0; _i3 < nodeSize; _i3++) {
        if (minDistancesColumn[_i3] > max_dist) {
          max_dist = minDistancesColumn[_i3];
          max_ind = _i3;
        }
      }
    }
    return max_ind;
  };

  // apply BFS to all nodes or selected samples
  var allBFS = function allBFS(samplingMethod) {

    var sample = void 0;

    if (!samplingMethod) {
      randomSampleCR();

      // call BFS
      for (var i = 0; i < sampleSize; i++) {
        BFS(samplesColumn[i], i, samplingMethod, false);
      }
    } else {
      sample = Math.floor(Math.random() * nodeSize);
      firstSample = sample;

      for (var _i4 = 0; _i4 < nodeSize; _i4++) {
        minDistancesColumn[_i4] = infinity;
      }

      for (var _i5 = 0; _i5 < sampleSize; _i5++) {
        samplesColumn[_i5] = sample;
        sample = BFS(sample, _i5, samplingMethod);
      }
    }

    // form the squared distances for C
    for (var _i6 = 0; _i6 < nodeSize; _i6++) {
      for (var j = 0; j < sampleSize; j++) {
        C[_i6][j] *= C[_i6][j];
      }
    }

    // form PHI
    for (var _i7 = 0; _i7 < sampleSize; _i7++) {
      PHI[_i7] = [];
    }

    for (var _i8 = 0; _i8 < sampleSize; _i8++) {
      for (var _j = 0; _j < sampleSize; _j++) {
        PHI[_i8][_j] = C[samplesColumn[_j]][_i8];
      }
    }
  };

  // perform the SVD algorithm and apply a regularization step
  var sample = function sample() {

    var SVDResult = numeric.svd(PHI);

    var a_w = SVDResult.S;
    var a_u = SVDResult.U;
    var a_v = SVDResult.V;

    var max_s = a_w[0] * a_w[0] * a_w[0];

    var a_Sig = [];

    //  regularization
    for (var i = 0; i < sampleSize; i++) {
      a_Sig[i] = [];
      for (var j = 0; j < sampleSize; j++) {
        a_Sig[i][j] = 0;
        if (i == j) {
          a_Sig[i][j] = a_w[i] / (a_w[i] * a_w[i] + max_s / (a_w[i] * a_w[i]));
        }
      }
    }

    INV = aux.multMat(aux.multMat(a_v, a_Sig), numeric.transpose(a_u));
  };

  // calculate final coordinates 
  var powerIteration = function powerIteration() {
    // two largest eigenvalues
    var theta1 = void 0;
    var theta2 = void 0;

    // initial guesses for eigenvectors
    var Y1 = [];
    var Y2 = [];

    var V1 = [];
    var V2 = [];

    for (var i = 0; i < nodeSize; i++) {
      Y1[i] = Math.random();
      Y2[i] = Math.random();
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

      for (var _i9 = 0; _i9 < nodeSize; _i9++) {
        V1[_i9] = Y1[_i9];
      }

      Y1 = aux.multGamma(aux.multL(aux.multGamma(V1), C, INV));
      theta1 = aux.dotProduct(V1, Y1);
      Y1 = aux.normalize(Y1);

      current = aux.dotProduct(V1, Y1);

      temp = Math.abs(current / previous);

      if (temp <= 1 + piTol && temp >= 1) {
        break;
      }

      previous = current;
    }

    for (var _i10 = 0; _i10 < nodeSize; _i10++) {
      V1[_i10] = Y1[_i10];
    }

    count = 0;
    previous = small;
    while (true) {
      count++;

      for (var _i11 = 0; _i11 < nodeSize; _i11++) {
        V2[_i11] = Y2[_i11];
      }

      V2 = aux.minusOp(V2, aux.multCons(V1, aux.dotProduct(V1, V2)));
      Y2 = aux.multGamma(aux.multL(aux.multGamma(V2), C, INV));
      theta2 = aux.dotProduct(V2, Y2);
      Y2 = aux.normalize(Y2);

      current = aux.dotProduct(V2, Y2);

      temp = Math.abs(current / previous);

      if (temp <= 1 + piTol && temp >= 1) {
        break;
      }

      previous = current;
    }

    for (var _i12 = 0; _i12 < nodeSize; _i12++) {
      V2[_i12] = Y2[_i12];
    }

    // theta1 now contains dominant eigenvalue
    // theta2 now contains the second-largest eigenvalue
    // V1 now contains theta1's eigenvector
    // V2 now contains theta2's eigenvector

    //populate the two vectors
    xCoords = aux.multCons(V1, Math.sqrt(Math.abs(theta1)));
    yCoords = aux.multCons(V2, Math.sqrt(Math.abs(theta2)));
  };

  /**** Preparation for spectral layout (Preprocessing) ****/

  // connect disconnected components (first top level, then inside of each compound node)
  aux.connectComponents(cy, eles, aux.getTopMostNodes(nodes), dummyNodes);

  parentNodes.forEach(function (ele) {
    aux.connectComponents(cy, eles, aux.getTopMostNodes(ele.descendants()), dummyNodes);
  });

  // assign indexes to nodes (first real, then dummy nodes)
  var index = 0;
  for (var i = 0; i < nodes.length; i++) {
    if (!nodes[i].isParent()) {
      nodeIndexes.set(nodes[i].id(), index++);
    }
  }

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = dummyNodes.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      nodeIndexes.set(key, index++);
    }

    // instantiate the neighborhood matrix
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  for (var _i13 = 0; _i13 < nodeIndexes.size; _i13++) {
    allNodesNeighborhood[_i13] = [];
  }

  // form a parent-child map to keep representative node of each compound node  
  parentNodes.forEach(function (ele) {
    var children = ele.children();

    //      let random = 0;
    while (children.nodes(":childless").length == 0) {
      //        random = Math.floor(Math.random() * children.nodes().length); // if all children are compound then proceed randomly
      children = children.nodes()[0].children();
    }
    //  select the representative node - we can apply different methods here
    //      random = Math.floor(Math.random() * children.nodes(":childless").length);
    var index = 0;
    var min = children.nodes(":childless")[0].connectedEdges().length;
    children.nodes(":childless").forEach(function (ele2, i) {
      if (ele2.connectedEdges().length < min) {
        min = ele2.connectedEdges().length;
        index = i;
      }
    });
    parentChildMap.set(ele.id(), children.nodes(":childless")[index].id());
  });

  // add neighborhood relations (first real, then dummy nodes)
  nodes.forEach(function (ele) {
    var eleIndex = void 0;

    if (ele.isParent()) eleIndex = nodeIndexes.get(parentChildMap.get(ele.id()));else eleIndex = nodeIndexes.get(ele.id());

    ele.neighborhood().nodes().forEach(function (node) {
      if (eles.contains(ele.edgesWith(node))) {
        if (node.isParent()) allNodesNeighborhood[eleIndex].push(parentChildMap.get(node.id()));else allNodesNeighborhood[eleIndex].push(node.id());
      }
    });
  });

  var _loop = function _loop(_key) {
    var eleIndex = nodeIndexes.get(_key);
    var disconnectedId = void 0;
    dummyNodes.get(_key).forEach(function (id) {
      if (cy.getElementById(id).isParent()) disconnectedId = parentChildMap.get(id);else disconnectedId = id;

      allNodesNeighborhood[eleIndex].push(disconnectedId);
      allNodesNeighborhood[nodeIndexes.get(disconnectedId)].push(_key);
    });
  };

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = dummyNodes.keys()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _key = _step2.value;

      _loop(_key);
    }

    // nodeSize now only considers the size of transformed graph
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2.return) {
        _iterator2.return();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  nodeSize = nodeIndexes.size;

  var spectralResult = void 0;

  // If number of nodes in transformed graph is 1 or 2, either SVD or powerIteration causes problem
  // So skip spectral and layout the graph with cose
  if (nodeSize > 2) {
    // if # of nodes in transformed graph is smaller than sample size,
    // then use # of nodes as sample size
    sampleSize = nodeSize < options.sampleSize ? nodeSize : options.sampleSize;

    // instantiates the partial matrices that will be used in spectral layout
    for (var _i14 = 0; _i14 < nodeSize; _i14++) {
      C[_i14] = [];
    }
    for (var _i15 = 0; _i15 < sampleSize; _i15++) {
      INV[_i15] = [];
    }

    /**** Apply spectral layout ****/

    allBFS(samplingType);
    sample();
    powerIteration();

    spectralResult = { nodeIndexes: nodeIndexes, xCoords: xCoords, yCoords: yCoords };
    return spectralResult;
  } else {
    spectralResult = false;
    return spectralResult;
  }
};

module.exports = { spectralLayout: spectralLayout };

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var impl = __webpack_require__(2);

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
/* 7 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

/***/ })
/******/ ]);
});