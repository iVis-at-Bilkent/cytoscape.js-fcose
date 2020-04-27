/**
  The implementation of the constraints on the initial draft layout obtained by the spectral layout algorithm
  First calculate transformed draft layout and then final draft layout that satisfies the constraints
  initial draft layout -> transformed draft layout -> final draft layout
*/

const aux = require('./auxiliary');
const LinkedList = require('cose-base').layoutBase.LinkedList;

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
 
  // calculate difference between two position objects
  let calculatePositionDiff = function(pos1, pos2){
    return {x: pos1["x"] - pos2["x"], y: pos1["y"] - pos2["y"]};
  };
  
  // calculate average position of the nodes
  let calculateAvgPosition = function(nodes){
    let xPosSum = 0;
    let yPosSum = 0;    
    nodes.forEach(function(node){
      xPosSum += xCoords[nodeIndexes.get(node.id())];
      yPosSum += yCoords[nodeIndexes.get(node.id())];
    });
    
    return {x: xPosSum / nodes.length, y: yPosSum / nodes.length};
  };
  
  // find an appropriate positioning for the nodes in a given graph according to relative placement constraints
  // this function also takes the fixed nodes and alignment constraints into account
  // graph: dag to be evaluated, direction: "horizontal" or "vertical", 
  // fixedNodes: set of fixed nodes to consider during evaluation, dummyPositions: appropriate coordinates of the dummy nodes  
  let findAppropriatePositionForRelativePlacement = function(graph, direction, fixedNodes, dummyPositions){
    
    // find union of two sets
    function setUnion(setA, setB) {
      let union = new Set(setA);
      for (let elem of setB) {
          union.add(elem);
      }
      return union;
    }
    
    // find indegree count for each node
    let inDegrees = new Map();

    graph.forEach(function(value, key){
      inDegrees.set(key, 0);
    });      
    graph.forEach(function(value, key){
      value.forEach(function(adjacent){
        inDegrees.set(adjacent["id"], inDegrees.get(adjacent["id"]) + 1);  
      });       
    });

    let positionMap = new Map(); // keeps the position for each node
    let pastMap = new Map();  // keeps the predecessors(past) of a node
    let queue = new LinkedList();
    inDegrees.forEach(function(value, key){
      if(value == 0){
        queue.push(key);
        if(direction == "horizontal"){
          positionMap.set(key, xCoords[nodeIndexes.get(key)] ? xCoords[nodeIndexes.get(key)] : dummyPositions.get(key));
        }
        else{
          positionMap.set(key, yCoords[nodeIndexes.get(key)] ? yCoords[nodeIndexes.get(key)] : dummyPositions.get(key));
        }
      }
      else{
        positionMap.set(key, Number.NEGATIVE_INFINITY);       
      }
      if(fixedNodes){
        pastMap.set(key, new Set([key]));
      }
    });

    // calculate positions of the nodes
    while(queue.length != 0){
      let currentNode = queue.shift();
      let neighbors = graph.get(currentNode);
      neighbors.forEach(function(neighbor){
        if(positionMap.get(neighbor["id"]) < (positionMap.get(currentNode) + neighbor["gap"])){
          if(fixedNodes && fixedNodes.has(neighbor["id"])){
            let fixedPosition;
            if(direction == "horizontal"){
              fixedPosition = xCoords[nodeIndexes.get(neighbor["id"])] ? xCoords[nodeIndexes.get(neighbor["id"])] : dummyPositions.get(neighbor["id"]);
            }
            else{
              fixedPosition = yCoords[nodeIndexes.get(neighbor["id"])] ? yCoords[nodeIndexes.get(neighbor["id"])] : dummyPositions.get(neighbor["id"]);
            }
            positionMap.set(neighbor["id"], fixedPosition); // burda gereksiz işlem yapılabiliyor, düşün
            if(fixedPosition < (positionMap.get(currentNode) + neighbor["gap"])){
              let diff = (positionMap.get(currentNode) + neighbor["gap"]) - fixedPosition;
              pastMap.get(currentNode).forEach(function(nodeId){
                positionMap.set(nodeId, positionMap.get(nodeId) - diff);
              });
            }            
          }
          else{
            positionMap.set(neighbor["id"], positionMap.get(currentNode) + neighbor["gap"]);
          }
        }
        inDegrees.set(neighbor["id"], inDegrees.get(neighbor["id"]) - 1);
        if(inDegrees.get(neighbor["id"]) == 0){
          queue.push(neighbor["id"]);
        }
        if(fixedNodes){
          pastMap.set(neighbor["id"], setUnion(pastMap.get(neighbor["id"]), pastMap.get(currentNode)));
        }
      });
    }
    return positionMap;
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
  let dagUndirected = new Map(); // undirected version of the dag
  let components = []; // weakly connected components 
  
  // fill fixedNodes collection to use later
  if(constraints["fixedNodeConstraint"]) {
    constraints["fixedNodeConstraint"].forEach(function(nodeData){
      fixedNodes.merge(nodeData["node"]);
    });
  }
  
  // construct dag from relative placement constraints 
  if(constraints["relativePlacementConstraint"]) {
    // construct both directed and undirected version of the dag
    constraints["relativePlacementConstraint"].forEach(function(constraint){
      if(constraint["left"]){
        if(dag.has(constraint["left"].id())){
          dag.get(constraint["left"].id()).push({id: constraint["right"].id(), gap: constraint["gap"], direction: "horizontal"});
          dagUndirected.get(constraint["left"].id()).push({id: constraint["right"].id(), gap: constraint["gap"], direction: "horizontal"});
        }
        else{
          dag.set(constraint["left"].id(), [{id: constraint["right"].id(), gap: constraint["gap"], direction: "horizontal"}]);
          dagUndirected.set(constraint["left"].id(), [{id: constraint["right"].id(), gap: constraint["gap"], direction: "horizontal"}]); 
        }
        if(dag.has(constraint["right"].id())){
          dagUndirected.get(constraint["right"].id()).push({id: constraint["left"].id(), gap: constraint["gap"], direction: "horizontal"});          
        }
        else{
          dag.set(constraint["right"].id(), []);
          dagUndirected.set(constraint["right"].id(), [{id: constraint["left"].id(), gap: constraint["gap"], direction: "horizontal"}]);           
        }
      }
      else{
        if(dag.has(constraint["top"].id())){
          dag.get(constraint["top"].id()).push({id: constraint["bottom"].id(), gap: constraint["gap"], direction: "vertical"});
          dagUndirected.get(constraint["top"].id()).push({id: constraint["bottom"].id(), gap: constraint["gap"], direction: "vertical"});
        }
        else {
          dag.set(constraint["top"].id(), [{id: constraint["bottom"].id(), gap: constraint["gap"], direction: "vertical"}]);
          dagUndirected.set(constraint["top"].id(), [{id: constraint["bottom"].id(), gap: constraint["gap"], direction: "vertical"}]);          
        }        
        if(dag.has(constraint["bottom"].id())){
          dagUndirected.get(constraint["bottom"].id()).push({id: constraint["top"].id(), gap: constraint["gap"], direction: "vertical"});          
        }
        else{
          dag.set(constraint["bottom"].id(), []);
          dagUndirected.set(constraint["bottom"].id(), [{id: constraint["top"].id(), gap: constraint["gap"], direction: "vertical"}]);           
        }        
      }      
    });
    
    // find weakly connected components in dag
    let queue = new LinkedList();
    let visited = new Set();
    let count = 0;
    
    dagUndirected.forEach(function(value, key){
      if(!visited.has(key)){
        components[count] = [];
        let currentNode = key;
        queue.push(currentNode);
        visited.add(currentNode);
        components[count].push(currentNode);

        while(queue.length != 0){
          currentNode = queue.shift();
          let neighbors = dagUndirected.get(currentNode);
          neighbors.forEach(function(neighbor){
            if(!visited.has(neighbor["id"])){
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
    // find largest component in dag
    let largestComponentSize = 0;
    let largestComponentIndex = 0;
    for(let i = 0; i < components.length; i++){
      if(components[i].length > largestComponentSize){
        largestComponentSize = components[i].length;
        largestComponentIndex = i;
      }
    }
    // if largest component isn't dominant, then take the votes for reflection
    if(largestComponentSize < (dagUndirected.size / 2)){
      // variables to count votes
      let reflectOnY = 0, notReflectOnY = 0;
      let reflectOnX = 0, notReflectOnX = 0;

      constraints["relativePlacementConstraint"].forEach(function(constraint){
        if(constraint["left"]){
          (xCoords[nodeIndexes.get(constraint["left"].id())] - xCoords[nodeIndexes.get(constraint["right"].id())] >= 0) ? reflectOnY++ : notReflectOnY++;
        }
        else{
          (yCoords[nodeIndexes.get(constraint["top"].id())] - yCoords[nodeIndexes.get(constraint["bottom"].id())] >= 0) ? reflectOnX++ : notReflectOnX++;
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
    else{ // use largest component for transformation 
      // construct horizontal and vertical subgraphs in the largest component
      let subGraphOnHorizontal = new Map();
      let subGraphOnVertical = new Map();
      
      components[largestComponentIndex].forEach(function(nodeId){
          dag.get(nodeId).forEach(function(adjacent){
            if(adjacent["direction"] == "horizontal"){
              if(subGraphOnHorizontal.has(nodeId)){
                subGraphOnHorizontal.get(nodeId).push(adjacent);
              }
              else{
                subGraphOnHorizontal.set(nodeId, [adjacent]);
              }
              if(!subGraphOnHorizontal.has(adjacent["id"])){
                subGraphOnHorizontal.set(adjacent["id"], []);
              }
            }
            else{
              if(subGraphOnVertical.has(nodeId)){
                subGraphOnVertical.get(nodeId).push(adjacent);
              }
              else{
                subGraphOnVertical.set(nodeId, [adjacent]);
              }
              if(!subGraphOnVertical.has(adjacent["id"])){
                subGraphOnVertical.set(adjacent["id"], []);
              }              
            }
          });
      });
      // calculate appropriate positioning for subgraphs
      let positionMapHorizontal = findAppropriatePositionForRelativePlacement(subGraphOnHorizontal, "horizontal");
      let positionMapVertical = findAppropriatePositionForRelativePlacement(subGraphOnVertical, "vertical");
      
      // construct source and target configuration
      components[largestComponentIndex].forEach(function(nodeId, i){
        sourceMatrix[i] = [xCoords[nodeIndexes.get(nodeId)], yCoords[nodeIndexes.get(nodeId)]];
        targetMatrix[i] = [];
        if(positionMapHorizontal.has(nodeId)){
          targetMatrix[i][0] = positionMapHorizontal.get(nodeId);          
        }
        else{
          targetMatrix[i][0] = xCoords[nodeIndexes.get(nodeId)];                    
        }
        if(positionMapVertical.has(nodeId)){
          targetMatrix[i][1] = positionMapVertical.get(nodeId);
        }
        else{
          targetMatrix[i][1] = yCoords[nodeIndexes.get(nodeId)];
        }
      });

      transformationType = "full";
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
      let tempMatrix = aux.multMat(targetMatrixTranspose, aux.transpose(sourceMatrixTranspose)); // tempMatrix = A'B
      let SVDResult = aux.svd(tempMatrix); // SVD(A'B) = USV', svd function returns U, S and V 
      transformationMatrix = aux.multMat(SVDResult.V, aux.transpose(SVDResult.U)); // transformationMatrix = T = VU'
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

    if(constraints["relativePlacementConstraint"]){
      let nodeToDummyForVerticalAlignment = new Map();
      let nodeToDummyForHorizontalAlignment = new Map();
      let dummyToNodeForVerticalAlignment = new Map();
      let dummyToNodeForHorizontalAlignment = new Map();      
      let dummyPositionsForVerticalAlignment = new Map();
      let dummyPositionsForHorizontalAlignment = new Map();
      let fixedNodesOnHorizontal = new Set();
      let fixedNodesOnVertical = new Set();
      
      // fill maps and sets      
      fixedNodes.forEach(function(node){
        fixedNodesOnHorizontal.add(node.id());
        fixedNodesOnVertical.add(node.id());
      });
      
      if(constraints["alignmentConstraint"]){
        if(constraints["alignmentConstraint"]["vertical"]){
          let verticalAlignment = constraints["alignmentConstraint"]["vertical"];
          for(let i = 0; i < verticalAlignment.length; i++){
            dummyToNodeForVerticalAlignment.set("dummy" + i, []);
            verticalAlignment[i].forEach(function(node){
              nodeToDummyForVerticalAlignment.set(node.id(), "dummy" + i);
              dummyToNodeForVerticalAlignment.get("dummy" + i).push(node.id());
              if(node.anySame(fixedNodes)){
                fixedNodesOnHorizontal.add("dummy" + i);
              }
            });
            dummyPositionsForVerticalAlignment.set("dummy" + i, xCoords[nodeIndexes.get(verticalAlignment[i][0].id())]);
          }
        }
        if(constraints["alignmentConstraint"]["horizontal"]){
          let horizontalAlignment = constraints["alignmentConstraint"]["horizontal"];
          for(let i = 0; i < horizontalAlignment.length; i++){
            dummyToNodeForHorizontalAlignment.set("dummy" + i, []);
            horizontalAlignment[i].forEach(function(node){
              nodeToDummyForHorizontalAlignment.set(node.id(), "dummy" + i);
              dummyToNodeForHorizontalAlignment.get("dummy" + i).push(node.id());
              if(node.anySame(fixedNodes)){
                fixedNodesOnVertical.add("dummy" + i);
              }              
            });
            dummyPositionsForHorizontalAlignment.set("dummy" + i, yCoords[nodeIndexes.get(horizontalAlignment[i][0].id())]);
          }
        }        
      }
      
      // construct horizontal and vertical dags (subgraphs) from overall dag
      let dagOnHorizontal = new Map();
      let dagOnVertical = new Map();

      for(let nodeId of dag.keys()){
        dag.get(nodeId).forEach(function(adjacent){
          let sourceId;
          let targetNode;
          if(adjacent["direction"] == "horizontal"){
            sourceId = nodeToDummyForVerticalAlignment.get(nodeId) ? nodeToDummyForVerticalAlignment.get(nodeId) : nodeId;                        
            if(nodeToDummyForVerticalAlignment.get(adjacent["id"])){
              targetNode = {id: nodeToDummyForVerticalAlignment.get(adjacent["id"]), gap: adjacent["gap"], direction: adjacent["direction"]};
            }
            else{
              targetNode = adjacent;
            }            
            if(dagOnHorizontal.has(sourceId)){
              dagOnHorizontal.get(sourceId).push(targetNode);
            }
            else{
              dagOnHorizontal.set(sourceId, [targetNode]);
            }
            if(!dagOnHorizontal.has(targetNode["id"])){
              dagOnHorizontal.set(targetNode["id"], []);
            }
          }
          else{
            sourceId = nodeToDummyForHorizontalAlignment.get(nodeId) ? nodeToDummyForHorizontalAlignment.get(nodeId) : nodeId;                        
            if(nodeToDummyForHorizontalAlignment.get(adjacent["id"])){
              targetNode = {id: nodeToDummyForHorizontalAlignment.get(adjacent["id"]), gap: adjacent["gap"], direction: adjacent["direction"]};
            }
            else{
              targetNode = adjacent;
            }             
            if(dagOnVertical.has(sourceId)){
              dagOnVertical.get(sourceId).push(targetNode);
            }
            else{
              dagOnVertical.set(sourceId, [targetNode]);
            }
            if(!dagOnVertical.has(targetNode["id"])){
              dagOnVertical.set(targetNode["id"], []);
            }              
          }
        });
      }      
      
      // calculate appropriate positioning for subgraphs
      let positionMapHorizontal = findAppropriatePositionForRelativePlacement(dagOnHorizontal, "horizontal", fixedNodesOnHorizontal, dummyPositionsForVerticalAlignment);
      let positionMapVertical = findAppropriatePositionForRelativePlacement(dagOnVertical, "vertical", fixedNodesOnVertical, dummyPositionsForHorizontalAlignment);      

      // update positions of the nodes based on relative placement constraints
      for(let key of positionMapHorizontal.keys()){
        if(dummyToNodeForVerticalAlignment.get(key)){
          dummyToNodeForVerticalAlignment.get(key).forEach(function(nodeId){
            xCoords[nodeIndexes.get(nodeId)] = positionMapHorizontal.get(key);
          });
        }
        else{
          xCoords[nodeIndexes.get(key)] = positionMapHorizontal.get(key);
        }        
      }
      for(let key of positionMapVertical.keys()){
        if(dummyToNodeForHorizontalAlignment.get(key)){
          dummyToNodeForHorizontalAlignment.get(key).forEach(function(nodeId){
            yCoords[nodeIndexes.get(nodeId)] = positionMapVertical.get(key);
          });
        }
        else{
          yCoords[nodeIndexes.get(key)] = positionMapVertical.get(key);
        }        
      }      
    }    
  }
  
};

module.exports = { constraintHandler };
