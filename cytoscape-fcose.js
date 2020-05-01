(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("cose-base"));
	else if(typeof define === 'function' && define.amd)
		define(["cose-base"], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeFcose"] = factory(require("cose-base"));
	else
		root["cytoscapeFcose"] = factory(root["coseBase"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
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

auxiliary.transpose = function (array) {
  var result = [];

  for (var i = 0; i < array[0].length; i++) {
    result[i] = [];
    for (var j = 0; j < array.length; j++) {
      result[i][j] = array[j][i];
    }
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
  var left = Number.MAX_SAFE_INTEGER;
  var right = Number.MIN_SAFE_INTEGER;
  var top = Number.MAX_SAFE_INTEGER;
  var bottom = Number.MIN_SAFE_INTEGER;
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

/* Below singular value decomposition (svd) code including hypot function is adopted from https://github.com/dragonfly-ai/JamaJS
   Some changes are applied to make the code compatible with the fcose code and to make it independent from Jama.
   Input matrix is changed to a 2D array instead of Jama matrix. Matrix dimensions are taken according to 2D array instead of using Jama functions.
   An object that includes singular value components is created for return. 
   The types of input parameters of the hypot function are removed. 
   let is used instead of var for the variable initialization.
*/
/*
                               Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "{}"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright {yyyy} {name of copyright owner}

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

auxiliary.svd = function (A) {
  this.U = null;
  this.V = null;
  this.s = null;
  this.m = 0;
  this.n = 0;
  this.m = A.length;
  this.n = A[0].length;
  var nu = Math.min(this.m, this.n);
  this.s = function (s) {
    var a = [];
    while (s-- > 0) {
      a.push(0);
    }return a;
  }(Math.min(this.m + 1, this.n));
  this.U = function (dims) {
    var allocate = function allocate(dims) {
      if (dims.length == 0) {
        return 0;
      } else {
        var array = [];
        for (var i = 0; i < dims[0]; i++) {
          array.push(allocate(dims.slice(1)));
        }
        return array;
      }
    };
    return allocate(dims);
  }([this.m, nu]);
  this.V = function (dims) {
    var allocate = function allocate(dims) {
      if (dims.length == 0) {
        return 0;
      } else {
        var array = [];
        for (var i = 0; i < dims[0]; i++) {
          array.push(allocate(dims.slice(1)));
        }
        return array;
      }
    };
    return allocate(dims);
  }([this.n, this.n]);
  var e = function (s) {
    var a = [];
    while (s-- > 0) {
      a.push(0);
    }return a;
  }(this.n);
  var work = function (s) {
    var a = [];
    while (s-- > 0) {
      a.push(0);
    }return a;
  }(this.m);
  var wantu = true;
  var wantv = true;
  var nct = Math.min(this.m - 1, this.n);
  var nrt = Math.max(0, Math.min(this.n - 2, this.m));
  for (var k = 0; k < Math.max(nct, nrt); k++) {
    if (k < nct) {
      this.s[k] = 0;
      for (var i = k; i < this.m; i++) {
        this.s[k] = auxiliary.hypot(this.s[k], A[i][k]);
      }
      ;
      if (this.s[k] !== 0.0) {
        if (A[k][k] < 0.0) {
          this.s[k] = -this.s[k];
        }
        for (var _i4 = k; _i4 < this.m; _i4++) {
          A[_i4][k] /= this.s[k];
        }
        ;
        A[k][k] += 1.0;
      }
      this.s[k] = -this.s[k];
    }
    for (var j = k + 1; j < this.n; j++) {
      if (function (lhs, rhs) {
        return lhs && rhs;
      }(k < nct, this.s[k] !== 0.0)) {
        var t = 0;
        for (var _i5 = k; _i5 < this.m; _i5++) {
          t += A[_i5][k] * A[_i5][j];
        }
        ;
        t = -t / A[k][k];
        for (var _i6 = k; _i6 < this.m; _i6++) {
          A[_i6][j] += t * A[_i6][k];
        }
        ;
      }
      e[j] = A[k][j];
    }
    ;
    if (function (lhs, rhs) {
      return lhs && rhs;
    }(wantu, k < nct)) {
      for (var _i7 = k; _i7 < this.m; _i7++) {
        this.U[_i7][k] = A[_i7][k];
      }
      ;
    }
    if (k < nrt) {
      e[k] = 0;
      for (var _i8 = k + 1; _i8 < this.n; _i8++) {
        e[k] = auxiliary.hypot(e[k], e[_i8]);
      }
      ;
      if (e[k] !== 0.0) {
        if (e[k + 1] < 0.0) {
          e[k] = -e[k];
        }
        for (var _i9 = k + 1; _i9 < this.n; _i9++) {
          e[_i9] /= e[k];
        }
        ;
        e[k + 1] += 1.0;
      }
      e[k] = -e[k];
      if (function (lhs, rhs) {
        return lhs && rhs;
      }(k + 1 < this.m, e[k] !== 0.0)) {
        for (var _i10 = k + 1; _i10 < this.m; _i10++) {
          work[_i10] = 0.0;
        }
        ;
        for (var _j3 = k + 1; _j3 < this.n; _j3++) {
          for (var _i11 = k + 1; _i11 < this.m; _i11++) {
            work[_i11] += e[_j3] * A[_i11][_j3];
          }
          ;
        }
        ;
        for (var _j4 = k + 1; _j4 < this.n; _j4++) {
          var _t = -e[_j4] / e[k + 1];
          for (var _i12 = k + 1; _i12 < this.m; _i12++) {
            A[_i12][_j4] += _t * work[_i12];
          }
          ;
        }
        ;
      }
      if (wantv) {
        for (var _i13 = k + 1; _i13 < this.n; _i13++) {
          this.V[_i13][k] = e[_i13];
        };
      }
    }
  };
  var p = Math.min(this.n, this.m + 1);
  if (nct < this.n) {
    this.s[nct] = A[nct][nct];
  }
  if (this.m < p) {
    this.s[p - 1] = 0.0;
  }
  if (nrt + 1 < p) {
    e[nrt] = A[nrt][p - 1];
  }
  e[p - 1] = 0.0;
  if (wantu) {
    for (var _j5 = nct; _j5 < nu; _j5++) {
      for (var _i14 = 0; _i14 < this.m; _i14++) {
        this.U[_i14][_j5] = 0.0;
      }
      ;
      this.U[_j5][_j5] = 1.0;
    };
    for (var _k = nct - 1; _k >= 0; _k--) {
      if (this.s[_k] !== 0.0) {
        for (var _j6 = _k + 1; _j6 < nu; _j6++) {
          var _t2 = 0;
          for (var _i15 = _k; _i15 < this.m; _i15++) {
            _t2 += this.U[_i15][_k] * this.U[_i15][_j6];
          };
          _t2 = -_t2 / this.U[_k][_k];
          for (var _i16 = _k; _i16 < this.m; _i16++) {
            this.U[_i16][_j6] += _t2 * this.U[_i16][_k];
          };
        };
        for (var _i17 = _k; _i17 < this.m; _i17++) {
          this.U[_i17][_k] = -this.U[_i17][_k];
        };
        this.U[_k][_k] = 1.0 + this.U[_k][_k];
        for (var _i18 = 0; _i18 < _k - 1; _i18++) {
          this.U[_i18][_k] = 0.0;
        };
      } else {
        for (var _i19 = 0; _i19 < this.m; _i19++) {
          this.U[_i19][_k] = 0.0;
        };
        this.U[_k][_k] = 1.0;
      }
    };
  }
  if (wantv) {
    for (var _k2 = this.n - 1; _k2 >= 0; _k2--) {
      if (function (lhs, rhs) {
        return lhs && rhs;
      }(_k2 < nrt, e[_k2] !== 0.0)) {
        for (var _j7 = _k2 + 1; _j7 < nu; _j7++) {
          var _t3 = 0;
          for (var _i20 = _k2 + 1; _i20 < this.n; _i20++) {
            _t3 += this.V[_i20][_k2] * this.V[_i20][_j7];
          };
          _t3 = -_t3 / this.V[_k2 + 1][_k2];
          for (var _i21 = _k2 + 1; _i21 < this.n; _i21++) {
            this.V[_i21][_j7] += _t3 * this.V[_i21][_k2];
          };
        };
      }
      for (var _i22 = 0; _i22 < this.n; _i22++) {
        this.V[_i22][_k2] = 0.0;
      };
      this.V[_k2][_k2] = 1.0;
    };
  }
  var pp = p - 1;
  var iter = 0;
  var eps = Math.pow(2.0, -52.0);
  var tiny = Math.pow(2.0, -966.0);
  while (p > 0) {
    var _k3 = void 0;
    var kase = void 0;
    for (_k3 = p - 2; _k3 >= -1; _k3--) {
      if (_k3 === -1) {
        break;
      }
      if (Math.abs(e[_k3]) <= tiny + eps * (Math.abs(this.s[_k3]) + Math.abs(this.s[_k3 + 1]))) {
        e[_k3] = 0.0;
        break;
      }
    };
    if (_k3 === p - 2) {
      kase = 4;
    } else {
      var ks = void 0;
      for (ks = p - 1; ks >= _k3; ks--) {
        if (ks === _k3) {
          break;
        }
        var _t4 = (ks !== p ? Math.abs(e[ks]) : 0.0) + (ks !== _k3 + 1 ? Math.abs(e[ks - 1]) : 0.0);
        if (Math.abs(this.s[ks]) <= tiny + eps * _t4) {
          this.s[ks] = 0.0;
          break;
        }
      };
      if (ks === _k3) {
        kase = 3;
      } else if (ks === p - 1) {
        kase = 1;
      } else {
        kase = 2;
        _k3 = ks;
      }
    }
    _k3++;
    switch (kase) {
      case 1:
        {
          var f = e[p - 2];
          e[p - 2] = 0.0;
          for (var _j8 = p - 2; _j8 >= _k3; _j8--) {
            var _t5 = auxiliary.hypot(this.s[_j8], f);
            var cs = this.s[_j8] / _t5;
            var sn = f / _t5;
            this.s[_j8] = _t5;
            if (_j8 !== _k3) {
              f = -sn * e[_j8 - 1];
              e[_j8 - 1] = cs * e[_j8 - 1];
            }
            if (wantv) {
              for (var _i23 = 0; _i23 < this.n; _i23++) {
                _t5 = cs * this.V[_i23][_j8] + sn * this.V[_i23][p - 1];
                this.V[_i23][p - 1] = -sn * this.V[_i23][_j8] + cs * this.V[_i23][p - 1];
                this.V[_i23][_j8] = _t5;
              };
            }
          };
        };
        break;
      case 2:
        {
          var _f = e[_k3 - 1];
          e[_k3 - 1] = 0.0;
          for (var _j9 = _k3; _j9 < p; _j9++) {
            var _t6 = auxiliary.hypot(this.s[_j9], _f);
            var _cs = this.s[_j9] / _t6;
            var _sn = _f / _t6;
            this.s[_j9] = _t6;
            _f = -_sn * e[_j9];
            e[_j9] = _cs * e[_j9];
            if (wantu) {
              for (var _i24 = 0; _i24 < this.m; _i24++) {
                _t6 = _cs * this.U[_i24][_j9] + _sn * this.U[_i24][_k3 - 1];
                this.U[_i24][_k3 - 1] = -_sn * this.U[_i24][_j9] + _cs * this.U[_i24][_k3 - 1];
                this.U[_i24][_j9] = _t6;
              };
            }
          };
        };
        break;
      case 3:
        {
          var scale = Math.max(Math.max(Math.max(Math.max(Math.abs(this.s[p - 1]), Math.abs(this.s[p - 2])), Math.abs(e[p - 2])), Math.abs(this.s[_k3])), Math.abs(e[_k3]));
          var sp = this.s[p - 1] / scale;
          var spm1 = this.s[p - 2] / scale;
          var epm1 = e[p - 2] / scale;
          var sk = this.s[_k3] / scale;
          var ek = e[_k3] / scale;
          var b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2.0;
          var c = sp * epm1 * (sp * epm1);
          var shift = 0.0;
          if (function (lhs, rhs) {
            return lhs || rhs;
          }(b !== 0.0, c !== 0.0)) {
            shift = Math.sqrt(b * b + c);
            if (b < 0.0) {
              shift = -shift;
            }
            shift = c / (b + shift);
          }
          var _f2 = (sk + sp) * (sk - sp) + shift;
          var g = sk * ek;
          for (var _j10 = _k3; _j10 < p - 1; _j10++) {
            var _t7 = auxiliary.hypot(_f2, g);
            var _cs2 = _f2 / _t7;
            var _sn2 = g / _t7;
            if (_j10 !== _k3) {
              e[_j10 - 1] = _t7;
            }
            _f2 = _cs2 * this.s[_j10] + _sn2 * e[_j10];
            e[_j10] = _cs2 * e[_j10] - _sn2 * this.s[_j10];
            g = _sn2 * this.s[_j10 + 1];
            this.s[_j10 + 1] = _cs2 * this.s[_j10 + 1];
            if (wantv) {
              for (var _i25 = 0; _i25 < this.n; _i25++) {
                _t7 = _cs2 * this.V[_i25][_j10] + _sn2 * this.V[_i25][_j10 + 1];
                this.V[_i25][_j10 + 1] = -_sn2 * this.V[_i25][_j10] + _cs2 * this.V[_i25][_j10 + 1];
                this.V[_i25][_j10] = _t7;
              };
            }
            _t7 = auxiliary.hypot(_f2, g);
            _cs2 = _f2 / _t7;
            _sn2 = g / _t7;
            this.s[_j10] = _t7;
            _f2 = _cs2 * e[_j10] + _sn2 * this.s[_j10 + 1];
            this.s[_j10 + 1] = -_sn2 * e[_j10] + _cs2 * this.s[_j10 + 1];
            g = _sn2 * e[_j10 + 1];
            e[_j10 + 1] = _cs2 * e[_j10 + 1];
            if (wantu && _j10 < this.m - 1) {
              for (var _i26 = 0; _i26 < this.m; _i26++) {
                _t7 = _cs2 * this.U[_i26][_j10] + _sn2 * this.U[_i26][_j10 + 1];
                this.U[_i26][_j10 + 1] = -_sn2 * this.U[_i26][_j10] + _cs2 * this.U[_i26][_j10 + 1];
                this.U[_i26][_j10] = _t7;
              };
            }
          };
          e[p - 2] = _f2;
          iter = iter + 1;
        };
        break;
      case 4:
        {
          if (this.s[_k3] <= 0.0) {
            this.s[_k3] = this.s[_k3] < 0.0 ? -this.s[_k3] : 0.0;
            if (wantv) {
              for (var _i27 = 0; _i27 <= pp; _i27++) {
                this.V[_i27][_k3] = -this.V[_i27][_k3];
              };
            }
          }
          while (_k3 < pp) {
            if (this.s[_k3] >= this.s[_k3 + 1]) {
              break;
            }
            var _t8 = this.s[_k3];
            this.s[_k3] = this.s[_k3 + 1];
            this.s[_k3 + 1] = _t8;
            if (wantv && _k3 < this.n - 1) {
              for (var _i28 = 0; _i28 < this.n; _i28++) {
                _t8 = this.V[_i28][_k3 + 1];
                this.V[_i28][_k3 + 1] = this.V[_i28][_k3];
                this.V[_i28][_k3] = _t8;
              };
            }
            if (wantu && _k3 < this.m - 1) {
              for (var _i29 = 0; _i29 < this.m; _i29++) {
                _t8 = this.U[_i29][_k3 + 1];
                this.U[_i29][_k3 + 1] = this.U[_i29][_k3];
                this.U[_i29][_k3] = _t8;
              };
            }
            _k3++;
          };
          iter = 0;
          p--;
        };
        break;
    }
  };
  var result = { U: this.U, V: this.V, S: this.s };
  return result;
};

// sqrt(a^2 + b^2) without under/overflow.
auxiliary.hypot = function (a, b) {
  var r = void 0;
  if (Math.abs(a) > Math.abs(b)) {
    r = b / a;
    r = Math.abs(a) * Math.sqrt(1 + r * r);
  } else if (b != 0) {
    r = a / b;
    r = Math.abs(b) * Math.sqrt(1 + r * r);
  } else {
    r = 0.0;
  }
  return r;
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

var _require = __webpack_require__(6),
    spectralLayout = _require.spectralLayout;

var _require2 = __webpack_require__(4),
    constraintHandler = _require2.constraintHandler;

var _require3 = __webpack_require__(5),
    coseLayout = _require3.coseLayout;

var defaults = Object.freeze({

  // 'draft', 'default' or 'proof' 
  // - 'draft' only applies spectral layout 
  // - 'default' improves the quality with subsequent CoSE layout (fast cooling rate)
  // - 'proof' improves the quality with subsequent CoSE layout (slow cooling rate) 
  quality: "default",
  // Use random node positions at beginning of layout
  // if this is set to false, then quality option must be "proof"
  randomize: true,
  // Whether or not to animate the layout
  animate: true,
  // Duration of animation in ms, if enabled
  animationDuration: 1000,
  // Easing of animation, if enabled
  animationEasing: undefined,
  // Fit the viewport to the repositioned nodes
  fit: true,
  // Padding around layout
  padding: 30,
  // Whether to include labels in node dimensions. Valid in "proof" quality
  nodeDimensionsIncludeLabels: false,
  // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
  uniformNodeDimensions: false,
  // Whether to pack disconnected components - valid only if randomize: true
  packComponents: true,

  /* spectral layout options */

  // False for random, true for greedy
  samplingType: true,
  // Sample size to construct distance matrix
  sampleSize: 25,
  // Separation amount between nodes
  nodeSeparation: 75,
  // Power iteration tolerance
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

  /* Constraint options */

  // Fix required nodes to predefined positions 
  fixedNodeConstraint: undefined, // [{node: cy.$('#n1'), position: {x: 100, y: 200}]
  // Align required nodes in x/y direction
  alignmentConstraint: undefined, // {vertical: [[cy.$('#n1'), cy.$('#n2')], [cy.$('#n3'), cy.$('#n4')]]}
  // Place two nodes relatively in vertical/horizontal direction 
  relativePlacementConstraint: undefined, //  [{top: cy.$('#n1'), bottom: cy.$('#n2'), gap: 25}]

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

      // if there is no elements, return
      if (options.eles.length == 0) return;

      // if partial layout, update options.eles
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

      var constraintExist = options.fixedNodeConstraint || options.alignmentConstraint || options.relativePlacementConstraint;

      // get constraint data from options, if any exists and set some options
      if (constraintExist) {

        // constraints work with these options
        options.randomize = true;
        options.tile = false;
        options.packComponents = false;

        // if there exists relative placement constraint without gap value, set it to default 
        if (options.relativePlacementConstraint) {
          options.relativePlacementConstraint.forEach(function (constraint) {
            if (!constraint["gap"] && constraint["gap"] != 0) {
              if (constraint["left"]) {
                constraint["gap"] = options.idealEdgeLength + constraint["left"].width() / 2 + constraint["right"].width() / 2;
              } else {
                constraint["gap"] = options.idealEdgeLength + constraint["top"].height() / 2 + constraint["bottom"].height() / 2;
              }
            }
          });
        }
      }

      // decide component packing is enabled or not
      var layUtil = void 0;
      var packingEnabled = false;
      if (cy.layoutUtilities && options.packComponents && options.randomize) {
        layUtil = cy.layoutUtilities("get");
        if (!layUtil) layUtil = cy.layoutUtilities();
        packingEnabled = true;
      }

      // if packing is not enabled, perform layout on the whole graph
      if (!packingEnabled) {
        if (options.randomize) {
          var result = spectralLayout(options); // apply spectral layout

          if (options.step == "transformed" || options.step == "enforced" || options.step == "all") {
            // enforce constraints if any exists
            if (constraintExist) {
              constraintHandler(options, result);
            }
          }
          spectralResult.push(result);
          xCoords = spectralResult[0]["xCoords"];
          yCoords = spectralResult[0]["yCoords"];
        }
        // apply cose layout as postprocessing
        if (options.quality == "default" || options.quality == "proof") {
          coseResult.push(coseLayout(options, spectralResult[0]));
        }
      } else {
        // packing is enabled
        var topMostNodes = aux.getTopMostNodes(options.eles.nodes());
        components = aux.connectComponents(cy, options.eles, topMostNodes);

        //send each component to spectral layout
        if (options.randomize) {
          components.forEach(function (component) {
            options.eles = component;
            spectralResult.push(spectralLayout(options));
          });
        }

        if (options.quality == "default" || options.quality == "proof") {
          var toBeTiledNodes = cy.collection();
          if (options.tile) {
            // behave nodes to be tiled as one component
            var nodeIndexes = new Map();
            var _xCoords = [];
            var _yCoords = [];
            var count = 0;
            var tempSpectralResult = { nodeIndexes: nodeIndexes, xCoords: _xCoords, yCoords: _yCoords };
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
              spectralResult.push(tempSpectralResult);
              for (var i = indexesToBeDeleted.length - 1; i >= 0; i--) {
                components.splice(indexesToBeDeleted[i], 1);
                spectralResult.splice(indexesToBeDeleted[i], 1);
              };
            }
          }
          components.forEach(function (component, index) {
            // send each component to cose layout
            options.eles = component;
            coseResult.push(coseLayout(options, spectralResult[index]));
          });
        }

        // packing
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
                subgraph.nodes.push({ x: spectralResult[index].xCoords[nodeIndex] - node.boundingbox().w / 2, y: spectralResult[index].yCoords[nodeIndex] - node.boundingbox().h / 2, width: node.boundingbox().w, height: node.boundingbox().h });
              } else {
                var parentInfo = aux.calcBoundingBox(node, spectralResult[index].xCoords, spectralResult[index].yCoords, nodeIndexes);
                subgraph.nodes.push({ x: parentInfo.topLeftX, y: parentInfo.topLeftY, width: parentInfo.width, height: parentInfo.height });
              }
            } else {
              subgraph.nodes.push({ x: coseResult[index][node.id()].getLeft(), y: coseResult[index][node.id()].getTop(), width: coseResult[index][node.id()].getWidth(), height: coseResult[index][node.id()].getHeight() });
            }
          });
          component.edges().forEach(function (node) {
            var source = node.source();
            var target = node.target();
            if (options.quality == "draft") {
              var sourceNodeIndex = nodeIndexes.get(source.id());
              var targetNodeIndex = nodeIndexes.get(target.id());
              var sourceCenter = [];
              var targetCenter = [];
              if (source.isParent()) {
                var parentInfo = aux.calcBoundingBox(source, spectralResult[index].xCoords, spectralResult[index].yCoords, nodeIndexes);
                sourceCenter.push(parentInfo.topLeftX + parentInfo.width / 2);
                sourceCenter.push(parentInfo.topLeftY + parentInfo.height / 2);
              } else {
                sourceCenter.push(spectralResult[index].xCoords[sourceNodeIndex]);
                sourceCenter.push(spectralResult[index].yCoords[sourceNodeIndex]);
              }
              if (target.isParent()) {
                var _parentInfo = aux.calcBoundingBox(target, spectralResult[index].xCoords, spectralResult[index].yCoords, nodeIndexes);
                targetCenter.push(_parentInfo.topLeftX + _parentInfo.width / 2);
                targetCenter.push(_parentInfo.topLeftY + _parentInfo.height / 2);
              } else {
                targetCenter.push(spectralResult[index].xCoords[targetNodeIndex]);
                targetCenter.push(spectralResult[index].yCoords[targetNodeIndex]);
              }
              subgraph.edges.push({ startX: sourceCenter[0], startY: sourceCenter[1], endX: targetCenter[0], endY: targetCenter[1] });
            } else {
              subgraph.edges.push({ startX: coseResult[index][source.id()].getCenterX(), startY: coseResult[index][source.id()].getCenterY(), endX: coseResult[index][target.id()].getCenterX(), endY: coseResult[index][target.id()].getCenterY() });
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
        if (options.quality == "default" || options.quality == "proof") {
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
            }
          });
          if (_pos == undefined) _pos = { x: ele.position("x"), y: ele.position("y") };
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
  The implementation of the constraints on the initial draft layout obtained by the spectral layout algorithm
  First calculate transformed draft layout and then final draft layout that satisfies the constraints
  initial draft layout -> transformed draft layout -> final draft layout
*/

var aux = __webpack_require__(1);
var LinkedList = __webpack_require__(0).layoutBase.LinkedList;

var constraintHandler = function constraintHandler(options, spectralResult) {
  var cy = options.cy;
  var eles = options.eles;
  var nodes = eles.nodes();

  var nodeIndexes = spectralResult.nodeIndexes;
  var xCoords = spectralResult.xCoords;
  var yCoords = spectralResult.yCoords;

  var constraints = {};
  constraints["fixedNodeConstraint"] = options.fixedNodeConstraint;
  constraints["alignmentConstraint"] = options.alignmentConstraint;
  constraints["relativePlacementConstraint"] = options.relativePlacementConstraint;

  /* auxiliary functions */

  // calculate difference between two position objects
  var calculatePositionDiff = function calculatePositionDiff(pos1, pos2) {
    return { x: pos1["x"] - pos2["x"], y: pos1["y"] - pos2["y"] };
  };

  // calculate average position of the nodes
  var calculateAvgPosition = function calculateAvgPosition(nodes) {
    var xPosSum = 0;
    var yPosSum = 0;
    nodes.forEach(function (node) {
      xPosSum += xCoords[nodeIndexes.get(node.id())];
      yPosSum += yCoords[nodeIndexes.get(node.id())];
    });

    return { x: xPosSum / nodes.length, y: yPosSum / nodes.length };
  };

  // find an appropriate positioning for the nodes in a given graph according to relative placement constraints
  // this function also takes the fixed nodes and alignment constraints into account
  // graph: dag to be evaluated, direction: "horizontal" or "vertical", 
  // fixedNodes: set of fixed nodes to consider during evaluation, dummyPositions: appropriate coordinates of the dummy nodes  
  var findAppropriatePositionForRelativePlacement = function findAppropriatePositionForRelativePlacement(graph, direction, fixedNodes, dummyPositions) {

    // find union of two sets
    function setUnion(setA, setB) {
      var union = new Set(setA);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = setB[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var elem = _step.value;

          union.add(elem);
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

      return union;
    }

    // find indegree count for each node
    var inDegrees = new Map();

    graph.forEach(function (value, key) {
      inDegrees.set(key, 0);
    });
    graph.forEach(function (value, key) {
      value.forEach(function (adjacent) {
        inDegrees.set(adjacent["id"], inDegrees.get(adjacent["id"]) + 1);
      });
    });

    var positionMap = new Map(); // keeps the position for each node
    var pastMap = new Map(); // keeps the predecessors(past) of a node
    var queue = new LinkedList();
    inDegrees.forEach(function (value, key) {
      if (value == 0) {
        queue.push(key);
        if (direction == "horizontal") {
          positionMap.set(key, xCoords[nodeIndexes.get(key)] ? xCoords[nodeIndexes.get(key)] : dummyPositions.get(key));
        } else {
          positionMap.set(key, yCoords[nodeIndexes.get(key)] ? yCoords[nodeIndexes.get(key)] : dummyPositions.get(key));
        }
      } else {
        positionMap.set(key, Number.NEGATIVE_INFINITY);
      }
      if (fixedNodes) {
        pastMap.set(key, new Set([key]));
      }
    });

    // calculate positions of the nodes

    var _loop = function _loop() {
      var currentNode = queue.shift();
      var neighbors = graph.get(currentNode);
      neighbors.forEach(function (neighbor) {
        if (positionMap.get(neighbor["id"]) < positionMap.get(currentNode) + neighbor["gap"]) {
          if (fixedNodes && fixedNodes.has(neighbor["id"])) {
            var fixedPosition = void 0;
            if (direction == "horizontal") {
              fixedPosition = xCoords[nodeIndexes.get(neighbor["id"])] ? xCoords[nodeIndexes.get(neighbor["id"])] : dummyPositions.get(neighbor["id"]);
            } else {
              fixedPosition = yCoords[nodeIndexes.get(neighbor["id"])] ? yCoords[nodeIndexes.get(neighbor["id"])] : dummyPositions.get(neighbor["id"]);
            }
            positionMap.set(neighbor["id"], fixedPosition); // burda gereksiz işlem yapılabiliyor, düşün
            if (fixedPosition < positionMap.get(currentNode) + neighbor["gap"]) {
              var diff = positionMap.get(currentNode) + neighbor["gap"] - fixedPosition;
              pastMap.get(currentNode).forEach(function (nodeId) {
                positionMap.set(nodeId, positionMap.get(nodeId) - diff);
              });
            }
          } else {
            positionMap.set(neighbor["id"], positionMap.get(currentNode) + neighbor["gap"]);
          }
        }
        inDegrees.set(neighbor["id"], inDegrees.get(neighbor["id"]) - 1);
        if (inDegrees.get(neighbor["id"]) == 0) {
          queue.push(neighbor["id"]);
        }
        if (fixedNodes) {
          pastMap.set(neighbor["id"], setUnion(pastMap.get(neighbor["id"]), pastMap.get(currentNode)));
        }
      });
    };

    while (queue.length != 0) {
      _loop();
    }
    return positionMap;
  };

  /****  apply transformation to the initial draft layout to better align with constrained nodes ****/
  // solve the Orthogonal Procrustean Problem to rotate and/or reflect initial draft layout
  // here we follow the solution in Chapter 20.2 of Borg, I. & Groenen, P. (2005) Modern Multidimensional Scaling: Theory and Applications 

  /* construct source and target configurations */

  var targetMatrix = []; // A - target configuration
  var sourceMatrix = []; // B - source configuration 
  var transformationType = false; // false for no transformation, 'full' for rotation and/or reflection, 'reflectOnX' or 'reflectOnY' or 'reflectOnBoth' for only reflection
  var fixedNodes = cy.collection();
  var dag = new Map(); // adjacency list to keep directed acyclic graph (dag) that consists of relative placement constraints
  var dagUndirected = new Map(); // undirected version of the dag
  var components = []; // weakly connected components 

  // fill fixedNodes collection to use later
  if (constraints["fixedNodeConstraint"]) {
    constraints["fixedNodeConstraint"].forEach(function (nodeData) {
      fixedNodes.merge(nodeData["node"]);
    });
  }

  // construct dag from relative placement constraints 
  if (constraints["relativePlacementConstraint"]) {
    // construct both directed and undirected version of the dag
    constraints["relativePlacementConstraint"].forEach(function (constraint) {
      if (constraint["left"]) {
        if (dag.has(constraint["left"].id())) {
          dag.get(constraint["left"].id()).push({ id: constraint["right"].id(), gap: constraint["gap"], direction: "horizontal" });
          dagUndirected.get(constraint["left"].id()).push({ id: constraint["right"].id(), gap: constraint["gap"], direction: "horizontal" });
        } else {
          dag.set(constraint["left"].id(), [{ id: constraint["right"].id(), gap: constraint["gap"], direction: "horizontal" }]);
          dagUndirected.set(constraint["left"].id(), [{ id: constraint["right"].id(), gap: constraint["gap"], direction: "horizontal" }]);
        }
        if (dag.has(constraint["right"].id())) {
          dagUndirected.get(constraint["right"].id()).push({ id: constraint["left"].id(), gap: constraint["gap"], direction: "horizontal" });
        } else {
          dag.set(constraint["right"].id(), []);
          dagUndirected.set(constraint["right"].id(), [{ id: constraint["left"].id(), gap: constraint["gap"], direction: "horizontal" }]);
        }
      } else {
        if (dag.has(constraint["top"].id())) {
          dag.get(constraint["top"].id()).push({ id: constraint["bottom"].id(), gap: constraint["gap"], direction: "vertical" });
          dagUndirected.get(constraint["top"].id()).push({ id: constraint["bottom"].id(), gap: constraint["gap"], direction: "vertical" });
        } else {
          dag.set(constraint["top"].id(), [{ id: constraint["bottom"].id(), gap: constraint["gap"], direction: "vertical" }]);
          dagUndirected.set(constraint["top"].id(), [{ id: constraint["bottom"].id(), gap: constraint["gap"], direction: "vertical" }]);
        }
        if (dag.has(constraint["bottom"].id())) {
          dagUndirected.get(constraint["bottom"].id()).push({ id: constraint["top"].id(), gap: constraint["gap"], direction: "vertical" });
        } else {
          dag.set(constraint["bottom"].id(), []);
          dagUndirected.set(constraint["bottom"].id(), [{ id: constraint["top"].id(), gap: constraint["gap"], direction: "vertical" }]);
        }
      }
    });

    // find weakly connected components in dag
    var queue = new LinkedList();
    var visited = new Set();
    var count = 0;

    dagUndirected.forEach(function (value, key) {
      if (!visited.has(key)) {
        components[count] = [];
        var _currentNode = key;
        queue.push(_currentNode);
        visited.add(_currentNode);
        components[count].push(_currentNode);

        while (queue.length != 0) {
          _currentNode = queue.shift();
          var neighbors = dagUndirected.get(_currentNode);
          neighbors.forEach(function (neighbor) {
            if (!visited.has(neighbor["id"])) {
              queue.push(neighbor["id"]);
              visited.add(neighbor["id"]);
              components[count].push(neighbor["id"]);
            }
          });
        }
        count++;
      }
    });
  }

  // first check fixed node constraint
  if (constraints["fixedNodeConstraint"] && constraints["fixedNodeConstraint"].length > 1) {
    constraints["fixedNodeConstraint"].forEach(function (nodeData, i) {
      targetMatrix[i] = [nodeData["position"]["x"], nodeData["position"]["y"]];
      sourceMatrix[i] = [xCoords[nodeIndexes.get(nodeData["node"].id())], yCoords[nodeIndexes.get(nodeData["node"].id())]];
    });
    transformationType = "full";
  } else if (constraints["alignmentConstraint"]) {
    (function () {
      // then check alignment constraint  
      var count = 0;
      if (constraints["alignmentConstraint"]["vertical"]) {
        var verticalAlign = constraints["alignmentConstraint"]["vertical"];

        var _loop2 = function _loop2(i) {
          var alignmentSet = cy.collection();
          verticalAlign[i].forEach(function (node) {
            alignmentSet = alignmentSet.merge(node);
          });
          var intersection = alignmentSet.diff(fixedNodes).both;
          var xPos = void 0;
          if (intersection.length > 0) xPos = xCoords[nodeIndexes.get(intersection[0].id())];else xPos = calculateAvgPosition(alignmentSet)['x'];

          verticalAlign[i].forEach(function (node) {
            targetMatrix[count] = [xPos, yCoords[nodeIndexes.get(node.id())]];
            sourceMatrix[count] = [xCoords[nodeIndexes.get(node.id())], yCoords[nodeIndexes.get(node.id())]];
            count++;
          });
        };

        for (var i = 0; i < verticalAlign.length; i++) {
          _loop2(i);
        }
        transformationType = "full";
      }
      if (constraints["alignmentConstraint"]["horizontal"]) {
        var horizontalAlign = constraints["alignmentConstraint"]["horizontal"];

        var _loop3 = function _loop3(i) {
          var alignmentSet = cy.collection();
          horizontalAlign[i].forEach(function (node) {
            alignmentSet = alignmentSet.merge(node);
          });
          var intersection = alignmentSet.diff(fixedNodes).both;
          var yPos = void 0;
          if (intersection.length > 0) yPos = xCoords[nodeIndexes.get(intersection[0].id())];else yPos = calculateAvgPosition(alignmentSet)['y'];

          horizontalAlign[i].forEach(function (node) {
            targetMatrix[count] = [xCoords[nodeIndexes.get(node.id())], yPos];
            sourceMatrix[count] = [xCoords[nodeIndexes.get(node.id())], yCoords[nodeIndexes.get(node.id())]];
            count++;
          });
        };

        for (var i = 0; i < horizontalAlign.length; i++) {
          _loop3(i);
        }
        transformationType = "full";
      }
    })();
  } else if (constraints["relativePlacementConstraint"]) {
    // finally check relative placement constraint 
    // find largest component in dag
    var largestComponentSize = 0;
    var largestComponentIndex = 0;
    for (var i = 0; i < components.length; i++) {
      if (components[i].length > largestComponentSize) {
        largestComponentSize = components[i].length;
        largestComponentIndex = i;
      }
    }
    // if largest component isn't dominant, then take the votes for reflection
    if (largestComponentSize < dagUndirected.size / 2) {
      // variables to count votes
      var reflectOnY = 0,
          notReflectOnY = 0;
      var reflectOnX = 0,
          notReflectOnX = 0;

      constraints["relativePlacementConstraint"].forEach(function (constraint) {
        if (constraint["left"]) {
          xCoords[nodeIndexes.get(constraint["left"].id())] - xCoords[nodeIndexes.get(constraint["right"].id())] >= 0 ? reflectOnY++ : notReflectOnY++;
        } else {
          yCoords[nodeIndexes.get(constraint["top"].id())] - yCoords[nodeIndexes.get(constraint["bottom"].id())] >= 0 ? reflectOnX++ : notReflectOnX++;
        }
      });

      if (reflectOnY > notReflectOnY && reflectOnX > notReflectOnX) {
        transformationType = "reflectOnBoth";
      } else if (reflectOnY > notReflectOnY) {
        transformationType = "reflectOnY";
      } else if (reflectOnX > notReflectOnX) {
        transformationType = "reflectOnX";
      }
    } else {
      // use largest component for transformation 
      // construct horizontal and vertical subgraphs in the largest component
      var subGraphOnHorizontal = new Map();
      var subGraphOnVertical = new Map();

      components[largestComponentIndex].forEach(function (nodeId) {
        dag.get(nodeId).forEach(function (adjacent) {
          if (adjacent["direction"] == "horizontal") {
            if (subGraphOnHorizontal.has(nodeId)) {
              subGraphOnHorizontal.get(nodeId).push(adjacent);
            } else {
              subGraphOnHorizontal.set(nodeId, [adjacent]);
            }
            if (!subGraphOnHorizontal.has(adjacent["id"])) {
              subGraphOnHorizontal.set(adjacent["id"], []);
            }
          } else {
            if (subGraphOnVertical.has(nodeId)) {
              subGraphOnVertical.get(nodeId).push(adjacent);
            } else {
              subGraphOnVertical.set(nodeId, [adjacent]);
            }
            if (!subGraphOnVertical.has(adjacent["id"])) {
              subGraphOnVertical.set(adjacent["id"], []);
            }
          }
        });
      });
      // calculate appropriate positioning for subgraphs
      var positionMapHorizontal = findAppropriatePositionForRelativePlacement(subGraphOnHorizontal, "horizontal");
      var positionMapVertical = findAppropriatePositionForRelativePlacement(subGraphOnVertical, "vertical");

      // construct source and target configuration
      components[largestComponentIndex].forEach(function (nodeId, i) {
        sourceMatrix[i] = [xCoords[nodeIndexes.get(nodeId)], yCoords[nodeIndexes.get(nodeId)]];
        targetMatrix[i] = [];
        if (positionMapHorizontal.has(nodeId)) {
          targetMatrix[i][0] = positionMapHorizontal.get(nodeId);
        } else {
          targetMatrix[i][0] = xCoords[nodeIndexes.get(nodeId)];
        }
        if (positionMapVertical.has(nodeId)) {
          targetMatrix[i][1] = positionMapVertical.get(nodeId);
        } else {
          targetMatrix[i][1] = yCoords[nodeIndexes.get(nodeId)];
        }
      });

      transformationType = "full";
    }
  }

  // if transformation is required, then calculate and apply transformation matrix
  if (transformationType && (options.step == "transformed" || options.step == "all")) {
    /* calculate transformation matrix */
    var transformationMatrix = void 0;
    if (transformationType == "full") {
      var targetMatrixTranspose = aux.transpose(targetMatrix); // A'
      var sourceMatrixTranspose = aux.transpose(sourceMatrix); // B'

      // centralize transpose matrices
      for (var _i = 0; _i < targetMatrixTranspose.length; _i++) {
        targetMatrixTranspose[_i] = aux.multGamma(targetMatrixTranspose[_i]);
        sourceMatrixTranspose[_i] = aux.multGamma(sourceMatrixTranspose[_i]);
      }

      // do actual calculation for transformation matrix
      var tempMatrix = aux.multMat(targetMatrixTranspose, aux.transpose(sourceMatrixTranspose)); // tempMatrix = A'B
      var SVDResult = aux.svd(tempMatrix); // SVD(A'B) = USV', svd function returns U, S and V 
      transformationMatrix = aux.multMat(SVDResult.V, aux.transpose(SVDResult.U)); // transformationMatrix = T = VU'
    } else if (transformationType == "reflectOnBoth") {
      transformationMatrix = [[-1, 0], [0, -1]];
    } else if (transformationType == "reflectOnX") {
      transformationMatrix = [[1, 0], [0, -1]];
    } else if (transformationType == "reflectOnY") {
      transformationMatrix = [[-1, 0], [0, 1]];
    }
    /* apply found transformation matrix to obtain final draft layout */

    for (var _i2 = 0; _i2 < nodeIndexes.size; _i2++) {
      var temp1 = [xCoords[_i2], yCoords[_i2]];
      var temp2 = [transformationMatrix[0][0], transformationMatrix[1][0]];
      var temp3 = [transformationMatrix[0][1], transformationMatrix[1][1]];
      xCoords[_i2] = aux.dotProduct(temp1, temp2);
      yCoords[_i2] = aux.dotProduct(temp1, temp3);
    }
  }

  if (options.step == "enforced" || options.step == "all") {

    /****  enforce constraints on the transformed draft layout ****/

    /* first enforce fixed node constraint */

    if (constraints["fixedNodeConstraint"] && constraints["fixedNodeConstraint"].length > 0) {
      var translationAmount = { x: 0, y: 0 };
      constraints["fixedNodeConstraint"].forEach(function (nodeData, i) {
        var posInTheory = { x: xCoords[nodeIndexes.get(nodeData["node"].id())], y: yCoords[nodeIndexes.get(nodeData["node"].id())] };
        var posDesired = nodeData.position;
        var posDiff = calculatePositionDiff(posDesired, posInTheory);
        translationAmount.x += posDiff.x;
        translationAmount.y += posDiff.y;
      });
      translationAmount.x /= constraints["fixedNodeConstraint"].length;
      translationAmount.y /= constraints["fixedNodeConstraint"].length;

      xCoords.forEach(function (value, i) {
        xCoords[i] += translationAmount.x;
      });

      yCoords.forEach(function (value, i) {
        yCoords[i] += translationAmount.y;
      });

      constraints["fixedNodeConstraint"].forEach(function (nodeData) {
        xCoords[nodeIndexes.get(nodeData["node"].id())] = nodeData["position"]["x"];
        yCoords[nodeIndexes.get(nodeData["node"].id())] = nodeData["position"]["y"];
      });
    }

    /* then enforce alignment constraint */

    if (constraints["alignmentConstraint"]) {
      if (constraints["alignmentConstraint"]["vertical"]) {
        var xAlign = constraints["alignmentConstraint"]["vertical"];

        var _loop4 = function _loop4(_i3) {
          var alignmentSet = cy.collection();
          xAlign[_i3].forEach(function (node) {
            alignmentSet = alignmentSet.merge(node);
          });
          var intersection = alignmentSet.diff(fixedNodes).both;
          var xPos = void 0;
          if (intersection.length > 0) xPos = xCoords[nodeIndexes.get(intersection[0].id())];else xPos = calculateAvgPosition(alignmentSet)['x'];

          for (var j = 0; j < alignmentSet.length; j++) {
            var node = alignmentSet[j];
            if (!fixedNodes.contains(node)) xCoords[nodeIndexes.get(node.id())] = xPos;
          }
        };

        for (var _i3 = 0; _i3 < xAlign.length; _i3++) {
          _loop4(_i3);
        }
      }
      if (constraints["alignmentConstraint"]["horizontal"]) {
        var yAlign = constraints["alignmentConstraint"]["horizontal"];

        var _loop5 = function _loop5(_i4) {
          var alignmentSet = cy.collection();
          yAlign[_i4].forEach(function (node) {
            alignmentSet = alignmentSet.merge(node);
          });
          var intersection = alignmentSet.diff(fixedNodes).both;
          var yPos = void 0;
          if (intersection.length > 0) yPos = yCoords[nodeIndexes.get(intersection[0].id())];else yPos = calculateAvgPosition(alignmentSet)['y'];

          for (var j = 0; j < alignmentSet.length; j++) {
            var node = alignmentSet[j];
            if (!fixedNodes.contains(node)) yCoords[nodeIndexes.get(node.id())] = yPos;
          }
        };

        for (var _i4 = 0; _i4 < yAlign.length; _i4++) {
          _loop5(_i4);
        }
      }
    }

    /* finally enforce relative placement constraint */

    if (constraints["relativePlacementConstraint"]) {
      (function () {
        var nodeToDummyForVerticalAlignment = new Map();
        var nodeToDummyForHorizontalAlignment = new Map();
        var dummyToNodeForVerticalAlignment = new Map();
        var dummyToNodeForHorizontalAlignment = new Map();
        var dummyPositionsForVerticalAlignment = new Map();
        var dummyPositionsForHorizontalAlignment = new Map();
        var fixedNodesOnHorizontal = new Set();
        var fixedNodesOnVertical = new Set();

        // fill maps and sets      
        fixedNodes.forEach(function (node) {
          fixedNodesOnHorizontal.add(node.id());
          fixedNodesOnVertical.add(node.id());
        });

        if (constraints["alignmentConstraint"]) {
          if (constraints["alignmentConstraint"]["vertical"]) {
            var verticalAlignment = constraints["alignmentConstraint"]["vertical"];

            var _loop6 = function _loop6(_i5) {
              dummyToNodeForVerticalAlignment.set("dummy" + _i5, []);
              verticalAlignment[_i5].forEach(function (node) {
                nodeToDummyForVerticalAlignment.set(node.id(), "dummy" + _i5);
                dummyToNodeForVerticalAlignment.get("dummy" + _i5).push(node.id());
                if (node.anySame(fixedNodes)) {
                  fixedNodesOnHorizontal.add("dummy" + _i5);
                }
              });
              dummyPositionsForVerticalAlignment.set("dummy" + _i5, xCoords[nodeIndexes.get(verticalAlignment[_i5][0].id())]);
            };

            for (var _i5 = 0; _i5 < verticalAlignment.length; _i5++) {
              _loop6(_i5);
            }
          }
          if (constraints["alignmentConstraint"]["horizontal"]) {
            var horizontalAlignment = constraints["alignmentConstraint"]["horizontal"];

            var _loop7 = function _loop7(_i6) {
              dummyToNodeForHorizontalAlignment.set("dummy" + _i6, []);
              horizontalAlignment[_i6].forEach(function (node) {
                nodeToDummyForHorizontalAlignment.set(node.id(), "dummy" + _i6);
                dummyToNodeForHorizontalAlignment.get("dummy" + _i6).push(node.id());
                if (node.anySame(fixedNodes)) {
                  fixedNodesOnVertical.add("dummy" + _i6);
                }
              });
              dummyPositionsForHorizontalAlignment.set("dummy" + _i6, yCoords[nodeIndexes.get(horizontalAlignment[_i6][0].id())]);
            };

            for (var _i6 = 0; _i6 < horizontalAlignment.length; _i6++) {
              _loop7(_i6);
            }
          }
        }

        // construct horizontal and vertical dags (subgraphs) from overall dag
        var dagOnHorizontal = new Map();
        var dagOnVertical = new Map();

        var _loop8 = function _loop8(nodeId) {
          dag.get(nodeId).forEach(function (adjacent) {
            var sourceId = void 0;
            var targetNode = void 0;
            if (adjacent["direction"] == "horizontal") {
              sourceId = nodeToDummyForVerticalAlignment.get(nodeId) ? nodeToDummyForVerticalAlignment.get(nodeId) : nodeId;
              if (nodeToDummyForVerticalAlignment.get(adjacent["id"])) {
                targetNode = { id: nodeToDummyForVerticalAlignment.get(adjacent["id"]), gap: adjacent["gap"], direction: adjacent["direction"] };
              } else {
                targetNode = adjacent;
              }
              if (dagOnHorizontal.has(sourceId)) {
                dagOnHorizontal.get(sourceId).push(targetNode);
              } else {
                dagOnHorizontal.set(sourceId, [targetNode]);
              }
              if (!dagOnHorizontal.has(targetNode["id"])) {
                dagOnHorizontal.set(targetNode["id"], []);
              }
            } else {
              sourceId = nodeToDummyForHorizontalAlignment.get(nodeId) ? nodeToDummyForHorizontalAlignment.get(nodeId) : nodeId;
              if (nodeToDummyForHorizontalAlignment.get(adjacent["id"])) {
                targetNode = { id: nodeToDummyForHorizontalAlignment.get(adjacent["id"]), gap: adjacent["gap"], direction: adjacent["direction"] };
              } else {
                targetNode = adjacent;
              }
              if (dagOnVertical.has(sourceId)) {
                dagOnVertical.get(sourceId).push(targetNode);
              } else {
                dagOnVertical.set(sourceId, [targetNode]);
              }
              if (!dagOnVertical.has(targetNode["id"])) {
                dagOnVertical.set(targetNode["id"], []);
              }
            }
          });
        };

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = dag.keys()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var nodeId = _step2.value;

            _loop8(nodeId);
          }

          // calculate appropriate positioning for subgraphs
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

        var positionMapHorizontal = findAppropriatePositionForRelativePlacement(dagOnHorizontal, "horizontal", fixedNodesOnHorizontal, dummyPositionsForVerticalAlignment);
        var positionMapVertical = findAppropriatePositionForRelativePlacement(dagOnVertical, "vertical", fixedNodesOnVertical, dummyPositionsForHorizontalAlignment);

        // update positions of the nodes based on relative placement constraints

        var _loop9 = function _loop9(key) {
          if (dummyToNodeForVerticalAlignment.get(key)) {
            dummyToNodeForVerticalAlignment.get(key).forEach(function (nodeId) {
              xCoords[nodeIndexes.get(nodeId)] = positionMapHorizontal.get(key);
            });
          } else {
            xCoords[nodeIndexes.get(key)] = positionMapHorizontal.get(key);
          }
        };

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = positionMapHorizontal.keys()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var key = _step3.value;

            _loop9(key);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        var _loop10 = function _loop10(key) {
          if (dummyToNodeForHorizontalAlignment.get(key)) {
            dummyToNodeForHorizontalAlignment.get(key).forEach(function (nodeId) {
              yCoords[nodeIndexes.get(nodeId)] = positionMapVertical.get(key);
            });
          } else {
            yCoords[nodeIndexes.get(key)] = positionMapVertical.get(key);
          }
        };

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = positionMapVertical.keys()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var key = _step4.value;

            _loop10(key);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      })();
    }
  }
};

module.exports = { constraintHandler: constraintHandler };

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

  if (options.randomize) {
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
        if (options.randomize) {
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
          var labelPos = theChild.css("text-valign");
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

  // transfer cytoscape constraints to cose layout
  var processConstraints = function processConstraints(layout, options) {
    // get nodes to be fixed
    if (options.fixedNodeConstraint) {
      var fixedNodeConstraint = [];
      options.fixedNodeConstraint.forEach(function (constraint) {
        fixedNodeConstraint.push({ nodeId: constraint["node"].id(), position: constraint["position"] });
      });
      layout.constraints["fixedNodeConstraint"] = fixedNodeConstraint;
    }
    // get nodes to be aligned
    if (options.alignmentConstraint) {
      var alignmentConstraint = {};
      if (options.alignmentConstraint["vertical"]) {
        var verticalAligned = options.alignmentConstraint['vertical'];
        var verticalAlignedTemp = [];
        for (var i = 0; i < verticalAligned.length; i++) {
          var individualAlignmentSet = [];
          for (var j = 0; j < verticalAligned[i].length; j++) {
            individualAlignmentSet.push(verticalAligned[i][j].id());
          }
          verticalAlignedTemp.push(individualAlignmentSet);
        }
        alignmentConstraint["vertical"] = verticalAlignedTemp;
      }
      if (options.alignmentConstraint["horizontal"]) {
        var horizontalAligned = options.alignmentConstraint['horizontal'];
        var horizontalAlignedTemp = [];
        for (var _i = 0; _i < horizontalAligned.length; _i++) {
          var _individualAlignmentSet = [];
          for (var _j = 0; _j < horizontalAligned[_i].length; _j++) {
            _individualAlignmentSet.push(horizontalAligned[_i][_j].id());
          }
          horizontalAlignedTemp.push(_individualAlignmentSet);
        }
        alignmentConstraint["horizontal"] = horizontalAlignedTemp;
      }
      layout.constraints["alignmentConstraint"] = alignmentConstraint;
    }
    // get nodes to be relatively placed
    if (options.relativePlacementConstraint) {
      var relativePlacementConstraint = [];
      options.relativePlacementConstraint.forEach(function (constraint) {
        var tempObj = {};
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = Object.entries(constraint)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _ref = _step.value;

            var _ref2 = _slicedToArray(_ref, 2);

            var key = _ref2[0];
            var value = _ref2[1];

            if (key == "left" || key == "right" || key == "top" || key == "bottom") {
              tempObj[key] = value.id();
            } else {
              tempObj[key] = value;
            }
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

        relativePlacementConstraint.push(tempObj);
      });
      layout.constraints["relativePlacementConstraint"] = relativePlacementConstraint;
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
  LayoutConstants.DEFAULT_UNIFORM_LEAF_NODE_SIZES = options.uniformNodeDimensions;

  var coseLayout = new CoSELayout();
  var gm = coseLayout.newGraphManager();

  processChildrenList(gm.addRoot(), aux.getTopMostNodes(nodes), coseLayout, options);
  processEdges(coseLayout, gm, edges);
  processConstraints(coseLayout, options);

  coseLayout.runLayout();

  return idToLNode;
};

module.exports = { coseLayout: coseLayout };

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
  The implementation of the spectral layout that is the first part of the fcose layout algorithm
*/

var aux = __webpack_require__(1);

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

    var SVDResult = aux.svd(PHI);

    var a_q = SVDResult.S;
    var a_u = SVDResult.U;
    var a_v = SVDResult.V;

    var max_s = a_q[0] * a_q[0] * a_q[0];

    var a_Sig = [];

    //  regularization
    for (var i = 0; i < sampleSize; i++) {
      a_Sig[i] = [];
      for (var j = 0; j < sampleSize; j++) {
        a_Sig[i][j] = 0;
        if (i == j) {
          a_Sig[i][j] = a_q[i] / (a_q[i] * a_q[i] + max_s / (a_q[i] * a_q[i]));
        }
      }
    }

    INV = aux.multMat(aux.multMat(a_v, a_Sig), aux.transpose(a_u));
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

    if (options.step == "initial" || options.step == "all") {
      allBFS(samplingType);
      sample();
      powerIteration();

      spectralResult = { nodeIndexes: nodeIndexes, xCoords: xCoords, yCoords: yCoords };
    } else {
      nodeIndexes.forEach(function (value, key) {
        xCoords.push(cy.getElementById(key).position("x"));
        yCoords.push(cy.getElementById(key).position("y"));
      });
      spectralResult = { nodeIndexes: nodeIndexes, xCoords: xCoords, yCoords: yCoords };
    }
    return spectralResult;
  } else {
    var iterator = nodeIndexes.keys();
    var firstNode = cy.getElementById(iterator.next().value);
    var firstNodePos = firstNode.position();
    var firstNodeWidth = firstNode.outerWidth();
    xCoords.push(firstNodePos.x);
    yCoords.push(firstNodePos.y);
    if (nodeSize == 2) {
      var secondNode = cy.getElementById(iterator.next().value);
      var secondNodeWidth = secondNode.outerWidth();
      xCoords.push(firstNodePos.x + firstNodeWidth / 2 + secondNodeWidth / 2 + options.idealEdgeLength);
      yCoords.push(firstNodePos.y);
    }

    spectralResult = { nodeIndexes: nodeIndexes, xCoords: xCoords, yCoords: yCoords };
    return spectralResult;
  }
};

module.exports = { spectralLayout: spectralLayout };

/***/ }),
/* 7 */
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

/***/ })
/******/ ]);
});