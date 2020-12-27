(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeLayvo"] = factory();
	else
		root["cytoscapeLayvo"] = factory();
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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function () {
	var cy = this;
	return {
		generalProperties: function generalProperties() {
			return _generalProperties(cy);
		},
		differenceMetrics: differenceMetrics
	};
};

var _generalProperties = function _generalProperties(cy) {
	var totalEdgeLength = getTotalEdgeLength(cy);
	return {
		numberOfEdgeCrosses: findNumberOfCrosses(cy),
		numberOfNodeOverlaps: findNumberOfOverlappingNodes(cy),
		totalArea: getTotalArea(cy),
		totalEdgeLength: totalEdgeLength,
		averageEdgeLength: totalEdgeLength / cy.edges().length
	};
};

var findNumberOfCrosses = function findNumberOfCrosses(cy) {
	var doesIntersect = function doesIntersect(a, b, c, d, p, q, r, s) {
		var det, gamma, lambda;
		det = (c - a) * (s - q) - (r - p) * (d - b);
		if (det === 0) {
			return false;
		} else {
			lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
			gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
			return 0.01 < lambda && lambda < 0.99 && 0.1 < gamma && gamma < 0.99;
		}
	};

	var crosses = 0;
	var edgeArray = cy.edges().toArray();
	var sourcePositions = [];
	var targetPositions = [];

	for (var i = 0; i < edgeArray.length; i++) {
		sourcePositions.push(edgeArray[i].source().position());
		targetPositions.push(edgeArray[i].target().position());
	}

	for (var _i = 0; _i < edgeArray.length; _i++) {
		var p = sourcePositions[_i],
		    q = targetPositions[_i];
		for (var j = _i + 1; j < edgeArray.length; j++) {
			var r = sourcePositions[j],
			    s = targetPositions[j];
			if (doesIntersect(p.x, p.y, q.x, q.y, r.x, r.y, s.x, s.y)) {
				crosses++;
			}
		}
	}
	return crosses;
};

var findNumberOfOverlappingNodes = function findNumberOfOverlappingNodes(cy) {
	var doesOverlap = function doesOverlap(node, otherNode) {
		var bb = node.boundingBox({ includeLabels: false, includeOverlays: false }),
		    bbOther = otherNode.boundingBox({ includeLabels: false, includeOverlays: false });
		return !(bbOther.x1 > bb.x2 || bbOther.x2 < bb.x1 || bbOther.y1 > bb.y2 || bbOther.y2 < bb.y1);
	};

	var overlaps = 0;
	var nodeArray = cy.nodes().toArray();

	for (var i = 0; i < nodeArray.length; i++) {
		var node = nodeArray[i];
		for (var j = i + 1; j < nodeArray.length; j++) {
			var otherNode = nodeArray[j];
			if (!node.ancestors().union(node.descendants()).contains(otherNode) && doesOverlap(node, otherNode)) {
				overlaps++;
			}
		}
	}
	return overlaps;
};

var getTotalArea = function getTotalArea(cy) {
	var bb = cy.elements().boundingBox();
	return bb.w * bb.h;
};

var getTotalEdgeLength = function getTotalEdgeLength(cy) {
	var getDistance = function getDistance(p, q) {
		var dx = q.x - p.x,
		    dy = q.y - p.y;
		return Math.sqrt(dx * dx + dy * dy);
	};

	var totalLength = 0;
	var edgeArray = cy.edges().toArray();

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = edgeArray[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var edge = _step.value;

			var p = edge.source().position(),
			    q = edge.target().position();
			totalLength += getDistance(p, q);
		}
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

	return totalLength;
};

var getAverageEdgeLength = function getAverageEdgeLength(cy) {
	return getTotalEdgeLength(cy) / cy.edges().length;
};

var differenceMetrics = function differenceMetrics(cy, otherCy) {
	// align
	cy.fit(50);otherCy.fit(50);

	if (cy.zoom() > otherCy.zoom()) {
		cy.zoom(otherCy.zoom());cy.pan(otherCy.pan());
	} else {
		otherCy.zoom(cy.zoom());otherCy.pan(cy.pan());
	}

	return {
		averageDistanceBetweenGraphs: getAverageDistanceBetweenGraphs(cy, otherCy),
		orthogonalOrdering: orthogonalOrdering(cy, otherCy)
	};
};

var getAverageDistanceBetweenGraphs = function getAverageDistanceBetweenGraphs(cy, otherCy) {
	var getDistance = function getDistance(p, q) {
		var dx = q.x - p.x,
		    dy = q.y - p.y;
		return Math.sqrt(dx * dx + dy * dy);
	};

	var totalDistance = 0,
	    numberOfNodes = 0;

	cy.nodes().forEach(function (ele) {
		var otherEle = otherCy.getElementById(ele.id());
		if (otherEle.length) {
			numberOfNodes++;
			totalDistance += getDistance(ele.renderedPosition(), otherEle.renderedPosition());
		}
	});
	return numberOfNodes ? totalDistance / numberOfNodes : 0;
};

var orthogonalOrdering = function orthogonalOrdering(cy, otherCy) {
	var calcEdgeAngle = function calcEdgeAngle(edge) {
		var dx = edge.targetEndpoint().x - edge.sourceEndpoint().x;
		var dy = edge.targetEndpoint().y - edge.sourceEndpoint().y;
		var angle = Math.atan2(dx, dy);
		return angle < 0 ? angle + 2 * Math.PI : angle;
	};

	var getWeight = function getWeight(theta, lowerBound, upperBound) {
		if (theta % Math.PI > Math.PI / 4) {
			var slope = -4 / Math.PI,
			    height = 2,
			    width = Math.PI / 2;
			var x = Math.floor(upperBound / width) - Math.floor(lowerBound / width);
			var area = 0;
			var lowerBoundY = 2 + lowerBound % width * slope,
			    upperBoundY = 2 + upperBound % width * slope;

			if (x > 0) {
				area = width * (x - 1);
				area += (width - lowerBound % width) * lowerBoundY / 2;
				area += (height + upperBoundY) / 2 * (upperBound % width);
			} else {
				area += (lowerBoundY + upperBoundY) / 2 * ((upperBound - lowerBound) % width);
			}
			return area;
		} else {
			var _slope = 4 / Math.PI,
			    _height = 2,
			    _width = Math.PI / 2;
			var _x = Math.floor(upperBound / _width) - Math.floor(lowerBound / _width);
			var _area = _width * Math.floor((upperBound - lowerBound) / _width);
			var _lowerBoundY = lowerBound % _width * _slope,
			    _upperBoundY = upperBound % _width * _slope;

			if (_x > 0) {
				_area = _width * (_x - 1);
				_area += (_width - lowerBound % _width) * (_height + _lowerBoundY) / 2;
				_area += _upperBoundY * (upperBound % _width) / 2;
			} else {
				_area += (_lowerBoundY + _upperBoundY) / 2 * ((upperBound - lowerBound) % _width);
			}
			return _area;
		}
	};

	var getOrder = function getOrder(edge, otherEdge) {
		var totalWeight = 0,
		    angle = calcEdgeAngle(edge),
		    otherAngle = calcEdgeAngle(otherEdge);

		if (angle > otherAngle) {
			var _ref = [otherAngle, angle];
			angle = _ref[0];
			otherAngle = _ref[1];
		}
		var upperBound = 0;
		while (upperBound != otherAngle) {
			upperBound = Math.PI / 4 * (Math.floor(angle / (Math.PI / 4)) + 1);

			if (upperBound > otherAngle) {
				upperBound = otherAngle;
			}

			if (angle % Math.PI / 2 > Math.PI / 4) {
				totalWeight += getWeight(5, angle, upperBound);
			} else {
				totalWeight += getWeight(0, angle, upperBound);
			}

			angle = upperBound;
		}
		return totalWeight;
	};

	var totalAngle = 0,
	    numberOfEdges = 0;

	cy.edges().forEach(function (ele) {
		var otherEle = otherCy.getElementById(ele.id());
		if (otherEle.length) {
			numberOfEdges++;
			totalAngle += Math.min(getOrder(ele, otherEle), getOrder(otherEle, ele));
		}
	});
	console.log(totalAngle);
	return numberOfEdges ? totalAngle / numberOfEdges : 0;
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var impl = __webpack_require__(0);

// registers the extension on a cytoscape lib ref
var register = function register(cytoscape) {
  if (!cytoscape) {
    return;
  } // can't register if cytoscape unspecified

  cytoscape('core', 'layvo', impl); // register with cytoscape.js
};

if (typeof cytoscape !== 'undefined') {
  // expose to global cytoscape (i.e. window.cytoscape)
  register(cytoscape);
}

module.exports = register;

/***/ })
/******/ ]);
});