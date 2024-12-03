let handleTreeConstraint = function (options) {
  let cy = options.cy;
  let eles = options.eles;
  let treeConstraint = options.treeConstraint;

  let levelOrders = getFlatForest(eles).levelOrders;

  // not a tree/forest
  if (levelOrders.length == 0) {
    console.log("Given graph/component is not a tree/forest!");
    return undefined;
  }
  // set alignment constraints
  let alignmentConstarint = {};

  if (treeConstraint.direction == "L-R" || treeConstraint.direction == "R-L") {
    alignmentConstarint.vertical = [];
    levelOrders.forEach((levelOrder) => {
      levelOrder.forEach((value, key, map) => {
        if(value.length > 1)
          alignmentConstarint.vertical.push(value);
      });
    });
  } else {
    alignmentConstarint.horizontal = [];
    levelOrders.forEach((levelOrder) => {
      levelOrder.forEach((value, key, map) => {
        if(value.length > 1)
          alignmentConstarint.horizontal.push(value);
      });
    });
  }

  // set relative placement constraints
  let relativePlacementConstraint = [];
  eles.edges().forEach((edge) => {
    if (treeConstraint.direction == "L-R") {
      relativePlacementConstraint.push({left: edge.source().id(), right: edge.target().id(), gap: treeConstraint.gap});
    } else if (treeConstraint.direction == "R-L") {
      relativePlacementConstraint.push({left: edge.target().id(), right: edge.source().id(), gap: treeConstraint.gap});
    } else if (treeConstraint.direction == "T-B") {
      relativePlacementConstraint.push({top: edge.source().id(), bottom: edge.target().id(), gap: treeConstraint.gap});
    } else if (treeConstraint.direction == "B-T") {
      relativePlacementConstraint.push({top: edge.target().id(), bottom: edge.source().id(), gap: treeConstraint.gap});
    } else {
      console.log("Invalid direction");
    }
  });

  levelOrders.forEach((levelOrder) => {
    levelOrder.forEach((value, key, map) => {
      if(value.length > 1) {
        for (let i = 0; i < value.length - 1; i++){
          if (treeConstraint.direction == "L-R") {
            relativePlacementConstraint.push({bottom: value[i], top: value[i+1], gap: treeConstraint.gap});
          } else if (treeConstraint.direction == "R-L") {
            relativePlacementConstraint.push({top: value[i], bottom: value[i+1], gap: treeConstraint.gap});
          } else if (treeConstraint.direction == "T-B") {
            relativePlacementConstraint.push({left: value[i], right: value[i+1], gap: treeConstraint.gap});
          } else if (treeConstraint.direction == "B-T") {
            relativePlacementConstraint.push({right: value[i], left: value[i+1], gap: treeConstraint.gap});
          } else {
            console.log("Invalid direction");
          }
        };
      }
    });
  });

  return {alignmentConstarint, relativePlacementConstraint};
}

/**
 * This method returns a list of trees where each tree is represented as a
 * list of node ids. The method returns a list of size 0 when:
 * - The graph is not flat or
 * - One of the component(s) of the graph is not a tree.
 */
let getFlatForest = function (eles) {
  let flatForest = [];
  let isForest = true;

  // simple nodes
  let allNodes = eles.nodes();

  // First be sure that the graph is flat
  let isFlat = true;

  for (var i = 0; i < allNodes.length; i++) {
    if (allNodes[i].parent().length > 0) {
      isFlat = false;
    }
  }

  // Return empty forest if the graph is not flat.
  if (!isFlat) {
    return flatForest;
  }

  // Be sure that no node has more than one incoming edges
  let invalidNodes = eles.nodes().filter((node)=>{
    return node.incomers().edges().length > 1;
  });

  // Return empty forest if the graph is not flat.
  if (invalidNodes.length > 1) {
    return flatForest;
  }

  // Run BFS for each component of the graph.

  let visited = new Set();
  let toBeVisited = [];
  let parents = new Map();
  let unprocessedNodes = cy.collection();
  let levelOrders = [];

  unprocessedNodes = unprocessedNodes.merge(allNodes);
  unprocessedNodes = unprocessedNodes.toArray();

  let roots = eles.nodes().filter((node)=>{
    return node.incomers().length == 0;
  }).toArray();

  // Each iteration of this loop finds a component of the graph and
  // decides whether it is a tree or not. If it is a tree, adds it to the
  // forest and continued with the next component.

  while (unprocessedNodes.length > 0 && roots.length > 0 && isForest) {
    toBeVisited.push([roots[0], 0]);
    roots.splice(0, 1);

    let levelOrder = new Map();

    // Start the BFS. Each iteration of this loop visits a node in a
    // BFS manner.
    while (toBeVisited.length > 0 && isForest) {
      //pool operation
      let currentNode = toBeVisited[0][0];
      let level = toBeVisited[0][1];
      toBeVisited.splice(0, 1);
      visited.add(currentNode);

      if (!levelOrder.has(level)) {
        levelOrder.set(level, []);
      }
      levelOrder.get(level).push(currentNode.id());

      // Traverse all neighbors of this node
      var neighbors = currentNode.neighborhood().nodes();

      for (var i = 0; i < neighbors.length; i++) {
        var currentNeighbor = neighbors[i];

        // If BFS is not growing from this neighbor.
        if (parents.get(currentNode) != currentNeighbor) {
          // We haven't previously visited this neighbor.
          if (!visited.has(currentNeighbor)) {
            toBeVisited.push([currentNeighbor, level + 1]);
            parents.set(currentNeighbor, currentNode);
          }
          // Since we have previously visited this neighbor and
          // this neighbor is not parent of currentNode, given
          // graph contains a component that is not tree, hence
          // it is not a forest.
          else {
            isForest = false;
            break;
          }
        }
      }
    }

    // The graph contains a component that is not a tree. Empty
    // previously found trees. The method will end.
    if (!isForest) {
      flatForest = [];
    }
    // Save currently visited nodes as a tree in our forest. Reset
    // visited and parents lists. Continue with the next component of
    // the graph, if any.
    else {
      var temp = [...visited];
      flatForest.push(temp);
      levelOrders.push(levelOrder);
      //flatForest = flatForest.concat(temp);
      //unProcessedNodes.removeAll(visited);
      for (var i = 0; i < temp.length; i++) {
        var value = temp[i];
        var index = unprocessedNodes.indexOf(value);
        if (index > -1) {
          unprocessedNodes.splice(index, 1);
        }
      }
      visited = new Set();
      parents = new Map();
      levelOrder = new Map();
    }
  }

  return {flatForest, levelOrders};
};

module.exports = { handleTreeConstraint };