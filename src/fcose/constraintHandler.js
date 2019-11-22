/**
  The implementation of the constraints after spectral layout is applied
*/

const aux = require('./auxiliary');
const numeric = require('numeric');

let constraintHandler = function(options, spectralResult, constraints, fixedNodes){
  let cy = options.cy;
  let eles = options.eles;
  let nodes = eles.nodes();
  
  let nodeIndexes = spectralResult.nodeIndexes;
  let xCoords = spectralResult.xCoords;
  let yCoords = spectralResult.yCoords;
    
//  let calculatePosition = function(node){
//    let xPosSum = 0;
//    let yPosSum = 0;
//    let neighborCount = 0;
//
//    node.neighborhood().nodes().not(":parent").forEach(function(neighborNode){
//      if(eles.contains(node.edgesWith(neighborNode)) && unconstrainedEles.contains(neighborNode)){
//        xPosSum += xCoords[nodeIndexes.get(neighborNode.id())];
//        yPosSum += yCoords[nodeIndexes.get(neighborNode.id())];
//        neighborCount++;
//      }
//    });
//    if(neighborCount == 0){
//      return {x: unconstrainedEles.nodes()[0].position('x'), y: unconstrainedEles.nodes()[0].position('y')}; // TO DO: think a better idea
//    }
//    return {x: xPosSum/neighborCount, y: yPosSum/neighborCount};
//  };
  
  let calculatePositionDiff = function(pos1, pos2){
    return {x: pos1["x"] - pos2["x"], y: pos1["y"] - pos2["y"]};
  };
  
  let calculateAvgPosition = function(nodes){
    let xPosSum = 0;
    let yPosSum = 0;    
    nodes.forEach(function(node){
      xPosSum += xCoords[nodeIndexes.get(node.id())];
      yPosSum += yCoords[nodeIndexes.get(node.id())];
    });
    
    return {x: xPosSum / nodes.length, y: yPosSum / nodes.length};
  };
  
  // handle fixedNodes contraints
  if(constraints["fixedNodesConstraint"].length > 0){
    /****  apply transformation to the draft graph to better align with fixed nodes ****/

    // first, solve the Orthogonal Procrustean Problem to rotate/reflect draft graph
    // here we follow the solution in Chapter 20.2 of Borg, I. & Groenen, P. (2005) Modern Multidimensional Scaling: Theory and Applications
    let fixedMatrix = []; // A
    let foundMatrix = []; // B
    let fixedMatrixTranspose = []; // A'
    let foundMatrixTranspose = []; // B'   
    let fixedNodesLength = constraints["fixedNodesConstraint"].length;
    
    constraints["fixedNodesConstraint"].forEach(function(nodeData, i){
      fixedMatrix[i] = [nodeData["position"]["x"], nodeData["position"]["y"]];
      foundMatrix[i] = [xCoords[nodeIndexes.get(nodeData.nodeId)], yCoords[nodeIndexes.get(nodeData.nodeId)]];           
    });
    
    fixedMatrixTranspose = numeric.transpose(fixedMatrix);
    foundMatrixTranspose = numeric.transpose(foundMatrix);
    
    // centralize transpose matrices
    for(let i = 0; i < fixedNodesLength; i++){
      fixedMatrixTranspose[i] = aux.multGamma(fixedMatrixTranspose[i]);
      foundMatrixTranspose[i] = aux.multGamma(foundMatrixTranspose[i]);
    }
    
    let tempMatrix = aux.multMat(fixedMatrixTranspose, numeric.transpose(foundMatrixTranspose)); // tempMatrix = A'B
    let SVDResult = numeric.svd(tempMatrix);
    let transformationMatrix = aux.multMat(numeric.transpose(SVDResult.V), numeric.transpose(SVDResult.U)); // transformationMatrix = T

    // apply found transformation matrix
    for(let i = 0; i < nodeIndexes.size; i++){
      let temp1 = [xCoords[i], yCoords[i]];
      let temp2 = [transformationMatrix[0][0], transformationMatrix[1][0]];
      let temp3 = [transformationMatrix[0][1], transformationMatrix[1][1]];
      xCoords[i] = aux.dotProduct(temp1, temp2);
      yCoords[i] = aux.dotProduct(temp1, temp3);
    }  

    // second, translate the draft graph towards the fixed nodes 
    let translationAmount = {x:0, y:0};
    constraints["fixedNodesConstraint"].forEach(function(nodeData, i){
      let posInTheory = {x: xCoords[nodeIndexes.get(nodeData.nodeId)], y: yCoords[nodeIndexes.get(nodeData.nodeId)]};
      let posDesired = nodeData.position;
      let posDiff = calculatePositionDiff(posDesired, posInTheory);
      translationAmount.x += posDiff.x;
      translationAmount.y += posDiff.y;
    });
    translationAmount.x /= constraints["fixedNodesConstraint"].length;
    translationAmount.y /= constraints["fixedNodesConstraint"].length;

    xCoords.forEach(function(value, i){
      xCoords[i] += translationAmount.x; 
    });

    yCoords.forEach(function(value, i){
      yCoords[i] += translationAmount.y; 
    });

    constraints["fixedNodesConstraint"].forEach(function(nodeData){
      xCoords[nodeIndexes.get(nodeData["nodeId"])] = nodeData["position"]["x"];
      yCoords[nodeIndexes.get(nodeData["nodeId"])] = nodeData["position"]["y"];
    });
  }
  
  // handle alignment constraints
  if(constraints["alignmentConstraint"]){
    if(constraints["alignmentConstraint"]["x"]){
      let xAlign = constraints["alignmentConstraint"]["x"];
      for(let i = 0; i < xAlign.length; i++){
        let alignmentSet = cy.collection();
        xAlign[i].forEach(function(node){
          alignmentSet = alignmentSet.union(node);
        });
        let intersection = alignmentSet.diff(fixedNodes).both;
        let xPos;
        if(intersection.length > 0)
          xPos = xCoords[nodeIndexes.get(intersection[0].id())];
        else
          xPos = calculateAvgPosition(alignmentSet)['x'];

        for(let j = 0; j < alignmentSet.length; j++){
          let node = alignmentSet[j];
          if(!fixedNodes.contains(node))
            xCoords[nodeIndexes.get(node.id())] = xPos;
        }
      }
    }
    if(constraints["alignmentConstraint"]["y"]){
      let yAlign = constraints["alignmentConstraint"]["y"];
      for(let i = 0; i < yAlign.length; i++){
        let alignmentSet = cy.collection();
        yAlign[i].forEach(function(node){
          alignmentSet = alignmentSet.union(node);
        });
        let intersection = alignmentSet.diff(fixedNodes).both;
        let yPos;
        if(intersection.length > 0)
          yPos = yCoords[nodeIndexes.get(intersection[0].id())];
        else
          yPos = calculateAvgPosition(alignmentSet)['y'];

        for(let j = 0; j < alignmentSet.length; j++){
          let node = alignmentSet[j];
          if(!fixedNodes.contains(node))
            yCoords[nodeIndexes.get(node.id())] = yPos;
        }
      }
    }    
  }
  
};

module.exports = { constraintHandler };
