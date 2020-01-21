/*
 * Auxiliary functions
 */

const LinkedList = require('cose-base').layoutBase.LinkedList;

let auxiliary = {};

auxiliary.multMat = function(array1, array2){
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

auxiliary.multGamma = function(array){
  let result = [];
  let sum = 0;

  for(let i = 0; i < array.length; i++){
    sum += array[i];
  }

  sum *= (-1)/array.length;

  for(let i = 0; i < array.length; i++){
    result[i] = sum + array[i];
  }     
  return result;
};

auxiliary.multL = function(array, C, INV){
  let result = [];
  let temp1 = [];
  let temp2 = [];

  // multiply by C^T
  for(let i = 0; i < C[0].length; i++){
    let sum = 0;
    for(let j = 0; j < C.length; j++){
      sum += -0.5 * C[j][i] * array[j]; 
    }
    temp1[i] = sum;
  }
  // multiply the result by INV
  for(let i = 0; i < INV.length; i++){
    let sum = 0;
    for(let j = 0; j < INV.length; j++){
      sum += INV[i][j] * temp1[j]; 
    }
    temp2[i] = sum;
  }  
  // multiply the result by C
  for(let i = 0; i < C.length; i++){
    let sum = 0;
    for(let j = 0; j < C[0].length; j++){
      sum += C[i][j] * temp2[j]; 
    }
    result[i] = sum;
  } 

  return result;
};

auxiliary.multCons = function(array, constant){
  let result = [];

  for(let i = 0; i < array.length; i++){
    result[i] = array[i] * constant;
  }

  return result;
};

// assumes arrays have same size
auxiliary.minusOp = function(array1, array2){
  let result = [];

  for(let i = 0; i < array1.length; i++){
    result[i] = array1[i] - array2[i];
  }

  return result;
};

// assumes arrays have same size
auxiliary.dotProduct = function(array1, array2){
  let product = 0;

  for(let i = 0; i < array1.length; i++){
    product += array1[i] * array2[i]; 
  }

  return product;
};

auxiliary.mag = function(array){
  return Math.sqrt(this.dotProduct(array, array));
};

auxiliary.normalize = function(array){
  let result = [];
  let magnitude = this.mag(array);

  for(let i = 0; i < array.length; i++){
    result[i] = array[i] / magnitude;
  }

  return result;
};

auxiliary.transpose = function(array){
  let result = [];
  
  for(let i = 0; i < array[0].length; i++){
    result[i] = [];
    for(let j = 0; j < array.length; j++){
      result[i][j] = array[j][i];
    }
  }
  
  return result;
};

// get the top most nodes
auxiliary.getTopMostNodes = function(nodes) {
  let nodesMap = {};
  for (let i = 0; i < nodes.length; i++) {
      nodesMap[nodes[i].id()] = true;
  }
  let roots = nodes.filter(function (ele, i) {
      if(typeof ele === "number") {
        ele = i;
      }
      let parent = ele.parent()[0];
      while(parent != null){
        if(nodesMap[parent.id()]){
          return false;
        }
        parent = parent.parent()[0];
      }
      return true;
  });

  return roots;
};

// find disconnected components and create dummy nodes that connect them
auxiliary.connectComponents = function(cy, eles, topMostNodes, dummyNodes){      
  let queue = new LinkedList();
  let visited = new Set();
  let visitedTopMostNodes = [];
  let currentNeighbor;
  let minDegreeNode;
  let minDegree;

  let isConnected = false;
  let count = 1;
  let nodesConnectedToDummy = [];
  let components = [];

  do{
    let cmpt = cy.collection();
    components.push(cmpt);
    
    let currentNode = topMostNodes[0];
    let childrenOfCurrentNode = cy.collection();
    childrenOfCurrentNode.merge(currentNode).merge(currentNode.descendants());
    visitedTopMostNodes.push(currentNode);

    childrenOfCurrentNode.forEach(function(node) {
      queue.push(node);
      visited.add(node);
      cmpt.merge(node);
    });

    while(queue.length != 0){
      currentNode = queue.shift();

      // Traverse all neighbors of this node
      let neighborNodes = cy.collection();
      currentNode.neighborhood().nodes().forEach(function(node){
        if(eles.contains(currentNode.edgesWith(node))){
          neighborNodes.merge(node);
        }
      });

      for(let i = 0; i < neighborNodes.length; i++){
        let neighborNode = neighborNodes[i];
        currentNeighbor = topMostNodes.intersection(neighborNode.union(neighborNode.ancestors()));
        if(currentNeighbor != null && !visited.has(currentNeighbor[0])){
          let childrenOfNeighbor = currentNeighbor.union(currentNeighbor.descendants());

          childrenOfNeighbor.forEach(function(node){
            queue.push(node);
            visited.add(node);
            cmpt.merge(node);
            if(topMostNodes.has(node)){
              visitedTopMostNodes.push(node);
            }
          });

        }
      }
    }
    
    cmpt.forEach(node => {
      node.connectedEdges().forEach(e => { // connectedEdges() usually cached
        if( cmpt.has(e.source()) && cmpt.has(e.target()) ){ // has() is cheap
          cmpt.merge(e); // forEach() only considers nodes -- sets N at call time
        }
      });
    });    

    if(visitedTopMostNodes.length == topMostNodes.length){
      isConnected = true;
    }

    if(!isConnected || (isConnected && count > 1)){
      minDegreeNode = visitedTopMostNodes[0];
      minDegree = minDegreeNode.connectedEdges().length;
      visitedTopMostNodes.forEach(function(node){
        if(node.connectedEdges().length < minDegree){
          minDegree = node.connectedEdges().length;
          minDegreeNode = node;
        }
      });
      nodesConnectedToDummy.push(minDegreeNode.id());
      // TO DO: Check efficiency of this part
      let temp = cy.collection();
      temp.merge(visitedTopMostNodes[0]);
      visitedTopMostNodes.forEach(function(node){
        temp.merge(node);
      });
      visitedTopMostNodes = [];
      topMostNodes = topMostNodes.difference(temp);
      count++;
    }

  }
  while(!isConnected);

  if(dummyNodes){
    if(nodesConnectedToDummy.length > 0 ){
        dummyNodes.set('dummy'+(dummyNodes.size+1), nodesConnectedToDummy);
    }
  }
  return components;
};

auxiliary.calcBoundingBox = function(parentNode, xCoords, yCoords, nodeIndexes){
    // calculate bounds
    let left = Number.MAX_VALUE;
    let right = Number.MIN_VALUE;
    let top = Number.MAX_VALUE;
    let bottom = Number.MIN_VALUE;
    let nodeLeft;
    let nodeRight;
    let nodeTop;
    let nodeBottom;

    let nodes = parentNode.descendants().not(":parent");
    let s = nodes.length;
    for (let i = 0; i < s; i++)
    {
      let node = nodes[i];

      nodeLeft = xCoords[nodeIndexes.get(node.id())] - node.width()/2;
      nodeRight = xCoords[nodeIndexes.get(node.id())] + node.width()/2;
      nodeTop = yCoords[nodeIndexes.get(node.id())] - node.height()/2;
      nodeBottom = yCoords[nodeIndexes.get(node.id())] + node.height()/2;

      if (left > nodeLeft)
      {
        left = nodeLeft;
      }

      if (right < nodeRight)
      {
        right = nodeRight;
      }

      if (top > nodeTop)
      {
        top = nodeTop;
      }

      if (bottom < nodeBottom)
      {
        bottom = nodeBottom;
      }
    }

    let boundingBox = {};
    boundingBox.topLeftX = left;
    boundingBox.topLeftY = top;
    boundingBox.width = right - left;
    boundingBox.height = bottom - top;
    return boundingBox;
};

// below singular value decomposition (svd) code is adopted from https://github.com/stardisblue/svdjs

/*
MIT License

Copyright (c) 2018 stardisblue

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

auxiliary.svd = function (a){

  let withu = true;
  let withv = true;
  let eps = Math.pow(2, -52);
  const tol = 1e-64 / eps;
  
  // throw error if a is not defined
  if (!a) {
    throw new TypeError("Matrix a is not defined");
  }

  // Householder's reduction to bidiagonal form

  const n = a[0].length;
  const m = a.length;

  if (m < n) {
    throw new TypeError("Invalid matrix: m < n");
  }

  let l1, c, f, h, s, y, z;

  let l = 0,
    g = 0,
    x = 0;
  const e = [];

  const u = [];
  const v = [];

  // Initialize u
  for (let i = 0; i < m; i++) {
    u[i] = new Array(n).fill(0);
  }

  // Initialize v
  for (let i = 0; i < n; i++) {
    v[i] = new Array(n).fill(0);
  }

  // Initialize q
  const q = new Array(n).fill(0);

  // Copy array a in u
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      u[i][j] = a[i][j];
    }
  }

  for (let i = 0; i < n; i++) {
    e[i] = g;
    s = 0;
    l = i + 1;
    for (let j = i; j < m; j++) {
      s += Math.pow(u[j][i], 2);
    }
    if (s < tol) {
      g = 0;
    } else {
      f = u[i][i];
      g = f < 0 ? Math.sqrt(s) : -Math.sqrt(s);
      h = f * g - s;
      u[i][i] = f - g;
      for (let j = l; j < n; j++) {
        s = 0;
        for (let k = i; k < m; k++) {
          s += u[k][i] * u[k][j];
        }
        f = s / h;
        for (let k = i; k < m; k++) {
          u[k][j] = u[k][j] + f * u[k][i];
        }
      }
    }
    q[i] = g;
    s = 0;
    for (let j = l; j < n; j++) {
      s += Math.pow(u[i][j], 2);
    }
    if (s < tol) {
      g = 0;
    } else {
      f = u[i][i + 1];
      g = f < 0 ? Math.sqrt(s) : -Math.sqrt(s);
      h = f * g - s;
      u[i][i + 1] = f - g;
      for (let j = l; j < n; j++) {
        e[j] = u[i][j] / h;
      }
      for (let j = l; j < m; j++) {
        s = 0;
        for (let k = l; k < n; k++) {
          s += u[j][k] * u[i][k];
        }
        for (let k = l; k < n; k++) {
          u[j][k] = u[j][k] + s * e[k];
        }
      }
    }
    y = Math.abs(q[i]) + Math.abs(e[i]);
    if (y > x) {
      x = y;
    }
  }

  // Accumulation of right-hand transformations
  if (withv) {
    for (let i = n - 1; i >= 0; i--) {
      if (g !== 0) {
        h = u[i][i + 1] * g;
        for (let j = l; j < n; j++) {
          v[j][i] = u[i][j] / h;
        }
        for (let j = l; j < n; j++) {
          s = 0;
          for (let k = l; k < n; k++) {
            s += u[i][k] * v[k][j];
          }
          for (let k = l; k < n; k++) {
            v[k][j] = v[k][j] + s * v[k][i];
          }
        }
      }
      for (let j = l; j < n; j++) {
        v[i][j] = 0;
        v[j][i] = 0;
      }
      v[i][i] = 1;
      g = e[i];
      l = i;
    }
  }

  // Accumulation of left-hand transformations
  if (withu) {
    for (let i = n - 1; i >= 0; i--) {
      l = i + 1;
      g = q[i];
      for (let j = l; j < n; j++) {
        u[i][j] = 0;
      }
      if (g !== 0) {
        h = u[i][i] * g;
        for (let j = l; j < n; j++) {
          s = 0;
          for (let k = l; k < m; k++) {
            s += u[k][i] * u[k][j];
          }
          f = s / h;
          for (let k = i; k < m; k++) {
            u[k][j] = u[k][j] + f * u[k][i];
          }
        }
        for (let j = i; j < m; j++) {
          u[j][i] = u[j][i] / g;
        }
      } else {
        for (let j = i; j < m; j++) {
          u[j][i] = 0;
        }
      }
      u[i][i] = u[i][i] + 1;
    }
  }

  // Diagonalization of the bidiagonal form
  eps = eps * x;
  let testConvergence;
  for (let k = n - 1; k >= 0; k--) {
    for (let iteration = 0; iteration < 50; iteration++) {
      // test-f-splitting
      testConvergence = false;
      for (l = k; l >= 0; l--) {
        if (Math.abs(e[l]) <= eps) {
          testConvergence = true;
          break;
        }
        if (Math.abs(q[l - 1]) <= eps) {
          break;
        }
      }

      if (!testConvergence) {
        // cancellation of e[l] if l>0
        c = 0;
        s = 1;
        l1 = l - 1;
        for (let i = l; i < k + 1; i++) {
          f = s * e[i];
          e[i] = c * e[i];
          if (Math.abs(f) <= eps) {
            break; // goto test-f-convergence
          }
          g = q[i];
          q[i] = Math.sqrt(f * f + g * g);
          h = q[i];
          c = g / h;
          s = -f / h;
          if (withu) {
            for (let j = 0; j < m; j++) {
              y = u[j][l1];
              z = u[j][i];
              u[j][l1] = y * c + z * s;
              u[j][i] = -y * s + z * c;
            }
          }
        }
      }

      // test f convergence
      z = q[k];
      if (l === k) {
        // convergence
        if (z < 0) {
          // q[k] is made non-negative
          q[k] = -z;
          if (withv) {
            for (let j = 0; j < n; j++) {
              v[j][k] = -v[j][k];
            }
          }
        }
        break; // break out of iteration loop and move on to next k value
      }

      // Shift from bottom 2x2 minor
      x = q[l];
      y = q[k - 1];
      g = e[k - 1];
      h = e[k];
      f = ((y - z) * (y + z) + (g - h) * (g + h)) / (2 * h * y);
      g = Math.sqrt(f * f + 1);
      f = ((x - z) * (x + z) + h * (y / (f < 0 ? f - g : f + g) - h)) / x;

      // Next QR transformation
      c = 1;
      s = 1;
      for (let i = l + 1; i < k + 1; i++) {
        g = e[i];
        y = q[i];
        h = s * g;
        g = c * g;
        z = Math.sqrt(f * f + h * h);
        e[i - 1] = z;
        c = f / z;
        s = h / z;
        f = x * c + g * s;
        g = -x * s + g * c;
        h = y * s;
        y = y * c;
        if (withv) {
          for (let j = 0; j < n; j++) {
            x = v[j][i - 1];
            z = v[j][i];
            v[j][i - 1] = x * c + z * s;
            v[j][i] = -x * s + z * c;
          }
        }
        z = Math.sqrt(f * f + h * h);
        q[i - 1] = z;
        c = f / z;
        s = h / z;
        f = c * g + s * y;
        x = -s * g + c * y;
        if (withu) {
          for (let j = 0; j < m; j++) {
            y = u[j][i - 1];
            z = u[j][i];
            u[j][i - 1] = y * c + z * s;
            u[j][i] = -y * s + z * c;
          }
        }
      }
      e[l] = 0;
      e[k] = f;
      q[k] = x;
    }
  }

  // Number below eps should be zero
  for (let i = 0; i < n; i++) {
    if (q[i] < eps) q[i] = 0;
  }

  return { u, q, v };
};

module.exports = auxiliary;