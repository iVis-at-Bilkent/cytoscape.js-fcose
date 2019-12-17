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
        if(eles.anySame(currentNode.edgesWith(node))){
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

module.exports = auxiliary;