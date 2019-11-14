/**
  The implementation of the constraints after spectral layout is applied
*/

let constraintHandler = function(options, spectralResult, constraints, unconstrainedEles){
  let cy = options.cy;
  let eles = options.eles;
  let nodes = eles.nodes();
  
  let nodeIndexes = spectralResult.nodeIndexes;
  let xCoords = spectralResult.xCoords;
  let yCoords = spectralResult.yCoords;
    
  let calculatePosition = function(node){
    let xPosSum = 0;
    let yPosSum = 0;
    let neighborCount = 0;

    node.neighborhood().nodes().not(":parent").forEach(function(neighborNode){
      if(eles.contains(node.edgesWith(neighborNode)) && unconstrainedEles.contains(neighborNode)){
        xPosSum += xCoords[nodeIndexes.get(neighborNode.id())];
        yPosSum += yCoords[nodeIndexes.get(neighborNode.id())];
        neighborCount++;
      }
    });
    if(neighborCount == 0){
      return {x: unconstrainedEles.nodes()[0].position('x'), y: unconstrainedEles.nodes()[0].position('y')}; // TO DO: think a better idea
    }
    return {x: xPosSum/neighborCount, y: yPosSum/neighborCount};
  };
  
  let calculatePositionDiff = function(pos1, pos2){
    return {x: pos1["x"] - pos2["x"], y: pos1["y"] - pos2["y"]};
  };
  
  if(constraints["fixedNodesConstraint"].length > 0){ 
    let translationAmount = {x:0, y:0};
    constraints["fixedNodesConstraint"].forEach(function(nodeData, i){
      let node = cy.getElementById(nodeData.nodeId);
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
  
};

module.exports = { constraintHandler };
