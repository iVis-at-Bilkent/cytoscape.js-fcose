/**
  The implementation of the constraints on the initial draft layout obtained by the spectral layout algorithm
  First calculate transformed draft layout and then final draft layout that satisfies the constraints
  initial draft layout -> transformed draft layout -> final draft layout
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
  
  /* auxiliary functions */
 
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
  
  /****  apply transformation to the initial draft layout to better align with constrained nodes ****/
  // solve the Orthogonal Procrustean Problem to rotate and/or reflect initial draft layout
  // here we follow the solution in Chapter 20.2 of Borg, I. & Groenen, P. (2005) Modern Multidimensional Scaling: Theory and Applications 
  
  /* construct source and target configurations */
  
  let targetMatrix = []; // A - target configuration
  let sourceMatrix = []; // B - source configuration 
  let isTransformationRequired = false;
  
  // first check fixed node constraint
  if(constraints["fixedNodeConstraint"] && constraints["fixedNodeConstraint"].length > 1){  
    constraints["fixedNodeConstraint"].forEach(function(nodeData, i){
      targetMatrix[i] = [nodeData["position"]["x"], nodeData["position"]["y"]];
      sourceMatrix[i] = [xCoords[nodeIndexes.get(nodeData["node"].id())], yCoords[nodeIndexes.get(nodeData["node"].id())]];           
    });
    isTransformationRequired = true;
  }
  else if(constraints["alignmentConstraint"]){  // then check alignment constraint  
    let count = 0; 
    if(constraints["alignmentConstraint"]["vertical"]){
      let verticalAlign = constraints["alignmentConstraint"]["vertical"];
      for(let i = 0; i < verticalAlign.length; i++){
        let alignmentSet = cy.collection();
        verticalAlign[i].forEach(function(node){
          alignmentSet = alignmentSet.union(node);
        });
        let intersection = alignmentSet.diff(fixedNodes).both;
        let xPos;
        if(intersection.length > 0)
          xPos = xCoords[nodeIndexes.get(intersection[0].id())];
        else
          xPos = calculateAvgPosition(alignmentSet)['x'];

        verticalAlign[i].forEach(function(node){
          targetMatrix[count] = [xPos, yCoords[nodeIndexes.get(node.id())]];
          sourceMatrix[count] = [xCoords[nodeIndexes.get(node.id())], yCoords[nodeIndexes.get(node.id())]];
          count++;
        });
      }
      isTransformationRequired = true;
    }
    if(constraints["alignmentConstraint"]["horizontal"]){
      let horizontalAlign = constraints["alignmentConstraint"]["horizontal"];
      for(let i = 0; i < horizontalAlign.length; i++){
        let alignmentSet = cy.collection();
        horizontalAlign[i].forEach(function(node){
          alignmentSet = alignmentSet.union(node);
        });
        let intersection = alignmentSet.diff(fixedNodes).both;
        let yPos;
        if(intersection.length > 0)
          yPos = xCoords[nodeIndexes.get(intersection[0].id())];
        else
          yPos = calculateAvgPosition(alignmentSet)['y'];

        horizontalAlign[i].forEach(function(node){
          targetMatrix[count] = [xCoords[nodeIndexes.get(node.id())], yPos];
          sourceMatrix[count] = [xCoords[nodeIndexes.get(node.id())], yCoords[nodeIndexes.get(node.id())]];
          count++;
        });
      }
      isTransformationRequired = true;
    }     
  }
//  else if(){  // finally check relative placement constraint 
//    
//  }

  // if transformation is required, then calculate and apply transformation matrix
  if(isTransformationRequired){
    /* calculate transformation matrix */

    let targetMatrixTranspose = numeric.transpose(targetMatrix);  // A'
    let sourceMatrixTranspose = numeric.transpose(sourceMatrix);  // B'

    // centralize transpose matrices
    for(let i = 0; i < targetMatrixTranspose.length; i++){
      targetMatrixTranspose[i] = aux.multGamma(targetMatrixTranspose[i]);
      sourceMatrixTranspose[i] = aux.multGamma(sourceMatrixTranspose[i]);
    }

    // do actual calculation for transformation matrix
    let tempMatrix = aux.multMat(targetMatrixTranspose, numeric.transpose(sourceMatrixTranspose)); // tempMatrix = A'B
    let SVDResult = numeric.svd(tempMatrix);
    let transformationMatrix = aux.multMat(numeric.transpose(SVDResult.V), numeric.transpose(SVDResult.U)); // transformationMatrix = T

    /* apply found transformation matrix to obtain final draft layout */

    for(let i = 0; i < nodeIndexes.size; i++){
      let temp1 = [xCoords[i], yCoords[i]];
      let temp2 = [transformationMatrix[0][0], transformationMatrix[1][0]];
      let temp3 = [transformationMatrix[0][1], transformationMatrix[1][1]];
      xCoords[i] = aux.dotProduct(temp1, temp2);
      yCoords[i] = aux.dotProduct(temp1, temp3);
    }
  }
  
  /****  enforce constraints on the transformed draft layout ****/
  
  /* first enforce fixed node constraint */
  if(constraints["fixedNodeConstraint"] && constraints["fixedNodeConstraint"].length > 0){ 
    let translationAmount = {x:0, y:0};
    constraints["fixedNodeConstraint"].forEach(function(nodeData, i){
      let posInTheory = {x: xCoords[nodeIndexes.get(nodeData["node"].id())], y: yCoords[nodeIndexes.get(nodeData["node"].id())]};
      let posDesired = nodeData.position;
      let posDiff = calculatePositionDiff(posDesired, posInTheory);
      translationAmount.x += posDiff.x;
      translationAmount.y += posDiff.y;
    });
    translationAmount.x /= constraints["fixedNodeConstraint"].length;
    translationAmount.y /= constraints["fixedNodeConstraint"].length;

    xCoords.forEach(function(value, i){
      xCoords[i] += translationAmount.x; 
    });

    yCoords.forEach(function(value, i){
      yCoords[i] += translationAmount.y; 
    });

    constraints["fixedNodeConstraint"].forEach(function(nodeData){
      xCoords[nodeIndexes.get(nodeData["node"].id())] = nodeData["position"]["x"];
      yCoords[nodeIndexes.get(nodeData["node"].id())] = nodeData["position"]["y"];
    });
  }
   
  /* then enforce alignment constraint */
  
  if(constraints["alignmentConstraint"]){
    if(constraints["alignmentConstraint"]["vertical"]){
      let xAlign = constraints["alignmentConstraint"]["vertical"];
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
    if(constraints["alignmentConstraint"]["horizontal"]){
      let yAlign = constraints["alignmentConstraint"]["horizontal"];
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
  
  /* finally enforce relative placement constraint */
  
  
};

module.exports = { constraintHandler };
