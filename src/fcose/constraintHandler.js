/**
  The implementation of the constraints on the initial draft layout obtained by the spectral layout algorithm
  First calculate transformed draft layout and then final draft layout that satisfies the constraints
  initial draft layout -> transformed draft layout -> final draft layout
*/

const aux = require('./auxiliary');

let constraintHandler = function(options, spectralResult){
  let cy = options.cy;
  let eles = options.eles;
  let nodes = eles.nodes();
  
  let nodeIndexes = spectralResult.nodeIndexes;
  let xCoords = spectralResult.xCoords;
  let yCoords = spectralResult.yCoords;
  
  let constraints = {};
  constraints["fixedNodeConstraint"] = options.fixedNodeConstraint;
  constraints["alignmentConstraint"] = options.alignmentConstraint;
  constraints["relativePlacementConstraint"] = options.relativePlacementConstraint;  
  
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
  let transformationType = false; // false for no transformation, 'full' for rotation and/or reflection, 'reflectOnX' or 'reflectOnY' or 'reflectOnBoth' for only reflection
  let fixedNodes = cy.collection();
  let dag = new Map(); // adjacency list to keep directed acyclic graph (dag) that consists of relative placement constraints
  
  // fill fixedNodes collection to use later
  if(constraints["fixedNodeConstraint"]) {
    constraints["fixedNodeConstraint"].forEach(function(nodeData){
      fixedNodes.merge(nodeData["node"]);
    });
  }
  
  // construct dag from relative placement constraints 
  if(constraints["relativePlacementConstraint"]) {
    constraints["relativePlacementConstraint"].forEach(function(constraint){
      if(constraint["left"]){
        if(dag.has(constraint["left"].id())){
          dag.get(constraint["left"].id()).push({id: constraint["right"].id(), gap: constraint["gap"] ? constraint["gap"] : (options.idealEdgeLength + constraint["left"].width()/2 + constraint["right"].width()/2), direction: "horizontal"});
        }
        else{
          dag.set(constraint["left"].id(), [{id: constraint["right"].id(), gap: constraint["gap"] ? constraint["gap"] : (options.idealEdgeLength + constraint["left"].width()/2 + constraint["right"].width()/2), direction: "horizontal"}]);
        }
      }
      else{
        if(dag.has(constraint["top"].id())){
          dag.get(constraint["top"].id()).push({id: constraint["bottom"].id(), gap: constraint["gap"] ? constraint["gap"] : (options.idealEdgeLength + constraint["top"].height()/2 + constraint["bottom"].height()/2), direction: "vertical"});
        }
        else {
          dag.set(constraint["top"].id(), [{id: constraint["bottom"].id(), gap: constraint["gap"] ? constraint["gap"] : (options.idealEdgeLength + constraint["top"].height()/2 + constraint["bottom"].height()/2), direction: "vertical"}]);
        }
      }      
    });
  }
  
  // first check fixed node constraint
  if(constraints["fixedNodeConstraint"] && constraints["fixedNodeConstraint"].length > 1){  
    constraints["fixedNodeConstraint"].forEach(function(nodeData, i){
      targetMatrix[i] = [nodeData["position"]["x"], nodeData["position"]["y"]];
      sourceMatrix[i] = [xCoords[nodeIndexes.get(nodeData["node"].id())], yCoords[nodeIndexes.get(nodeData["node"].id())]];      
    });
    transformationType = "full";
  }
  else if(constraints["alignmentConstraint"]){  // then check alignment constraint  
    let count = 0; 
    if(constraints["alignmentConstraint"]["vertical"]){
      let verticalAlign = constraints["alignmentConstraint"]["vertical"];
      for(let i = 0; i < verticalAlign.length; i++){
        let alignmentSet = cy.collection();
        verticalAlign[i].forEach(function(node){
          alignmentSet = alignmentSet.merge(node);
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
      transformationType = "full";
    }
    if(constraints["alignmentConstraint"]["horizontal"]){
      let horizontalAlign = constraints["alignmentConstraint"]["horizontal"];
      for(let i = 0; i < horizontalAlign.length; i++){
        let alignmentSet = cy.collection();
        horizontalAlign[i].forEach(function(node){
          alignmentSet = alignmentSet.merge(node);
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
      transformationType = "full";
    }     
  }
  else if(constraints["relativePlacementConstraint"]){  // finally check relative placement constraint 
    let reflectOnY = 0, notReflectOnY = 0;
    let reflectOnX = 0, notReflectOnX = 0;
    
    constraints["relativePlacementConstraint"].forEach(function(constraint){
      if(constraint["left"]){
        (xCoords[nodeIndexes.get(constraint["left"].id())] - xCoords[nodeIndexes.get(constraint["right"].id())] > 0) ? reflectOnY++ : notReflectOnY++;
      }
      else{
        (yCoords[nodeIndexes.get(constraint["top"].id())] - yCoords[nodeIndexes.get(constraint["bottom"].id())] > 0) ? reflectOnX++ : notReflectOnX++;
      }
    });
    if(reflectOnY > notReflectOnY && reflectOnX > notReflectOnX){
      transformationType = "reflectOnBoth";
    }
    else if(reflectOnY > notReflectOnY){
      transformationType = "reflectOnY";
    }
    else if(reflectOnX > notReflectOnX){
      transformationType = "reflectOnX";
    }    
  }

  // if transformation is required, then calculate and apply transformation matrix
  if(transformationType && (options.step == "transformed" || options.step == "all")){
    /* calculate transformation matrix */
    let transformationMatrix;
    if(transformationType == "full"){
      let targetMatrixTranspose = aux.transpose(targetMatrix);  // A'
      let sourceMatrixTranspose = aux.transpose(sourceMatrix);  // B'

      // centralize transpose matrices
      for(let i = 0; i < targetMatrixTranspose.length; i++){
        targetMatrixTranspose[i] = aux.multGamma(targetMatrixTranspose[i]);
        sourceMatrixTranspose[i] = aux.multGamma(sourceMatrixTranspose[i]);
      }

      // do actual calculation for transformation matrix
      // normally SVD(A'B) = USV' but transpose works better so compute SVD(B'A) = VSU' 
      let tempMatrix = aux.multMat(sourceMatrixTranspose, aux.transpose(targetMatrixTranspose)); // tempMatrix = B'A
      // this is required because sometimes svd cannot be calculated for long decimal values
      for(let i = 0; i < tempMatrix.length; i++){
        for(let j = 0; j < tempMatrix[0].length; j++){
          tempMatrix[i][j] = Math.round( tempMatrix[i][j] * 10 ) / 10;
        }
      }
      let SVDResult = aux.svd(tempMatrix); // SVD(B'A) = VSU'
      transformationMatrix = aux.multMat(SVDResult.u, aux.transpose(SVDResult.v)); // transformationMatrix = T = UV'
    }
    else if(transformationType == "reflectOnBoth"){
      transformationMatrix = [[-1, 0], [0, -1]];
    }
    else if(transformationType == "reflectOnX"){
      transformationMatrix = [[1, 0], [0, -1]];
    }
    else if(transformationType == "reflectOnY"){
      transformationMatrix = [[-1, 0], [0, 1]];
    }    
    /* apply found transformation matrix to obtain final draft layout */

    for(let i = 0; i < nodeIndexes.size; i++){
      let temp1 = [xCoords[i], yCoords[i]];
      let temp2 = [transformationMatrix[0][0], transformationMatrix[1][0]];
      let temp3 = [transformationMatrix[0][1], transformationMatrix[1][1]];
      xCoords[i] = aux.dotProduct(temp1, temp2);
      yCoords[i] = aux.dotProduct(temp1, temp3);
    }
  }
  
  if(options.step == "enforced" || options.step == "all") {
  
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
            alignmentSet = alignmentSet.merge(node);
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
            alignmentSet = alignmentSet.merge(node);
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
  }
  
};

module.exports = { constraintHandler };
