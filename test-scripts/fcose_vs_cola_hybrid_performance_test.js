const cytoscape = require('cytoscape');
const path = require('path');
const fs = require('fs');
const {performance} = require('perf_hooks');
const fcose = require('cytoscape-fcose');
const cola = require('cytoscape-cola');
const layvo = require('cytoscape-layvo');

cytoscape.use( fcose );
cytoscape.use( cola );
cytoscape.use( layvo );

let numberOfFiles = process.argv[2]; // number of test graphs
let ratio = process.argv[3] / 3; // ratio of the constrained nodes to all nodes

let moveFrom = "./graphs";
let moveTo = "./results";
let toPathRuntime = path.join(moveTo, "fcose_cola_hybrid_runtime_" + process.argv[3] + ".csv");
let toPathNodeOverlap = path.join(moveTo, "fcose_cola_hybrid_node_overlap_" + process.argv[3] + ".csv");
let toPathEdgeCrossing = path.join(moveTo, "fcose_cola_hybrid_edge_crossing_" + process.argv[3] + ".csv");
let toPathAvgEdgeLength = path.join(moveTo, "fcose_cola_hybrid_avg_edge_length_" + process.argv[3] + ".csv");
let toPathTotalArea = path.join(moveTo, "fcose_cola_hybrid_total_area_" + process.argv[3] + ".csv");

let runtime = [];
let nodeOverlap = [];
let edgeCrossing = [];
let avgEdgeLength = [];
let totalArea = [];

for (let i = 0; i < numberOfFiles; i++) {
  runtime[i] = [];
  nodeOverlap[i] = [];
  edgeCrossing[i] = [];
  avgEdgeLength[i] = [];
  totalArea[i] = [];
}

let files = fs.readdirSync(moveFrom);

files.forEach(function (file, fileIndex) {    
  let fromPath = path.join(moveFrom, file);   
  //let toPath = path.join(moveTo, file.split('.')[0] + "_compound" + ".json");    
  runtime[fileIndex][0] = file;
  nodeOverlap[fileIndex][0] = file;
  edgeCrossing[fileIndex][0] = file;
  avgEdgeLength[fileIndex][0] = file;
  totalArea[fileIndex][0] = file;

  let fileContent = fs.readFileSync(fromPath, 'utf8');

  let cy = cytoscape({
    headless: true,
    styleEnabled: true
  });
  //results += file + ',';

  cy.json({elements: JSON.parse(fileContent)});

  for(let i = 0; i < 5; i++) {

    //cy.nodes().unselect();
    let fixedNodes = [];
    let alignmentConstraint = {};
    let relativePlacementConstraint = [];

    let fixedNodesSet = new Set();
    let numberOfSimpleNodes = cy.nodes().not(':parent').length;
    //let ratio = parseInt(document.getElementById("fixedNodeRatio").value);
    //let maxShift = parseInt(document.getElementById("maxNodeShift").value);
    let maxShift = 60;

    let indexArray = Array.from(Array(numberOfSimpleNodes).keys());
    let shuffled = shuffle(indexArray);
    let selectedIndexes = shuffled.slice(0, Math.ceil(numberOfSimpleNodes * ratio / 100));

    //console.log(cy.nodes()[selectedIndexes[0]].position());
    cy.layout({name: 'fcose', quality: 'default', step: 'all', packComponents: false, animate: false, fit: false}).run(); 
    //console.log(cy.nodes()[selectedIndexes[0]].position());
    selectedIndexes.forEach(function(index){
      let node = cy.nodes().not(':parent')[index];
      let xDiff = Math.floor(Math.random() * (2 * maxShift + 1)) - maxShift;
      let yDiff = Math.floor(Math.random() * (2 * maxShift + 1)) - maxShift;
      //console.log(xDiff + ' ' + yDiff);
      node.select();
      node.shift({x: xDiff, y: yDiff});
      fixedNodes.push({nodeId: node.id(), position: node.position()});
      fixedNodesSet.add(node.id());
    });

    let alreadyOverlapping = findNumberOfOverlappingFixedNodes(cy, fixedNodesSet);

    console.log("Fixed finished!");

    let maxAlignedNodes = Math.round(numberOfSimpleNodes * ratio / 100);
    let simpleNodes = cy.nodes().not(':parent');
    let processedNodeIds = new Set();
    let alignments = [];
    let alignmentToFixedCheck = [];

    indexArray = Array.from(Array(numberOfSimpleNodes).keys());
    shuffled = shuffle(indexArray);

    let count = 0;
    let index = 0;
    while (count < maxAlignedNodes && index < numberOfSimpleNodes) {
      //let randomIndex = Math.floor(Math.random() * numberOfSimpleNodes);
      let randomIndex = shuffled[index];
      let randomNode = simpleNodes[randomIndex];
      if(!processedNodeIds.has(randomNode.id())) {
        let neighbors = randomNode.openNeighborhood().nodes().not(':parent');
        let neighbor = neighbors[Math.floor(Math.random() * neighbors.length)]; // random neighbor
        if(neighbor) {
          if(!processedNodeIds.has(neighbor.id())) {
            if(!fixedNodesSet.has(randomNode.id()) || !fixedNodesSet.has(neighbor.id())) {
              alignments.push([randomNode.id(), neighbor.id()]);
              processedNodeIds.add(randomNode.id());
              processedNodeIds.add(neighbor.id());
              randomNode.select();
              neighbor.select();
              count += 2;
              if(fixedNodesSet.has(randomNode.id()) || fixedNodesSet.has(neighbor.id())) {
                alignmentToFixedCheck.push(true);
              }
            }
          }
          else {
            alignments.forEach(function(array, index){
              array.forEach(function(nodeId){
                if(nodeId == neighbor.id()) {
                  if(!alignmentToFixedCheck[index]) {
                    array.push(randomNode.id());
                    processedNodeIds.add(randomNode.id());
                    randomNode.select();
                    count ++;
                  } 
                } 
              });
            });
          }
        }
      }
      index++;
    }

    let alignmentDirections = [];
    alignments.forEach(function(array){
      let randomDirection = Math.floor(Math.random() * 2); // 0 for horizontal 1 for vertical
      if(randomDirection) {
        if(alignmentConstraint.vertical) {
          alignmentConstraint.vertical.push(array);
        }
        else {
          alignmentConstraint.vertical = [array];
        }
        alignmentDirections.push('vertical');
      }
      else {
        if(alignmentConstraint.horizontal) {
          alignmentConstraint.horizontal.push(array);
        }
        else {
          alignmentConstraint.horizontal = [array];
        }
        alignmentDirections.push('horizontal');
      }
    });

    console.log("Alignment finished!");

    let maxRelativeNodes = Math.round(numberOfSimpleNodes * ratio / 100);
    simpleNodes = cy.nodes().not(':parent');
    processedNodeIds = new Set();
    let relativePlacements = [];

      
    indexArray = Array.from(Array(numberOfSimpleNodes).keys());
    shuffled = shuffle(indexArray);  

    count = 0;
    index = 0;
    while (count < maxRelativeNodes && index < numberOfSimpleNodes) {            
      // let randomIndex = Math.floor(Math.random() * numberOfSimpleNodes);
      let randomIndex = shuffled[index];            
      let randomNode = simpleNodes[randomIndex];
      if(!processedNodeIds.has(randomNode.id())) {
        let neighbors = randomNode.openNeighborhood().nodes().not(':parent');
        let neighbor = neighbors[Math.floor(Math.random() * neighbors.length)]; // random neighbor
        if(neighbor){
          if(!fixedNodesSet.has(randomNode.id()) || !fixedNodesSet.has(neighbor.id())) {              
            relativePlacements.push([randomNode.id(), neighbor.id()]);
            if(!processedNodeIds.has(neighbor.id())) {
              processedNodeIds.add(randomNode.id());
              processedNodeIds.add(neighbor.id());
              randomNode.select();
              neighbor.select();
              count += 2;
            }
            else {
              processedNodeIds.add(randomNode.id());
              randomNode.select();
              count++;
            }
          }
        }
      }
      index++;
    }
    //console.log(relativePlacements);
    relativePlacements.forEach(function(array){
      let decided = false;
      alignments.forEach(function(alignment, index){
        if(alignment.includes(array[0]) && alignment.includes(array[1])) {
          if(alignmentDirections[index] == 'vertical') {
            relativePlacementConstraint.push({top: array[0], bottom: array[1]});                  
          }
          else {
            relativePlacementConstraint.push({left: array[0], right: array[1]});
          }
          decided = true;
        }             
      });
      if(!decided) {
        let randomDirection = Math.floor(Math.random() * 2); // 0 for horizontal 1 for vertical
        if(randomDirection) {
          relativePlacementConstraint.push({top: array[0], bottom: array[1]});
        }
        else {
          relativePlacementConstraint.push({left: array[0], right: array[1]});
        }
      }
    });

    console.log("Relative finished!");

    let start = performance.now();
    cy.layout({name: 'fcose', quality: 'default', step: 'all', packComponents: false, animate: false, fit: false, fixedNodeConstraint: fixedNodes.length > 0 ? fixedNodes : undefined,
      alignmentConstraint: (alignmentConstraint.vertical || alignmentConstraint.horizontal) ? alignmentConstraint : undefined, 
      relativePlacementConstraint: relativePlacementConstraint.length > 0 ? relativePlacementConstraint : undefined}).run();
    let end = performance.now();

    console.log("Fcose finished!");

    let graphProperties = cy.layvo("get").generalProperties();
    runtime[fileIndex][i+1] = Math.round((end - start) * 10 ) / 10;
    nodeOverlap[fileIndex][i+1] = graphProperties.numberOfNodeOverlaps - alreadyOverlapping;
    edgeCrossing[fileIndex][i+1] = graphProperties.numberOfEdgeCrosses;
    avgEdgeLength[fileIndex][i+1] = Math.round(graphProperties.averageEdgeLength * 10 ) / 10;
    totalArea[fileIndex][i+1] = Math.round(graphProperties.totalArea * 10 ) / 10;

    console.log("Fcose evaluation finished!");

    fixedNodes.forEach(function(constraint){
      cy.getElementById(constraint.nodeId).lock();
    });
    let gapInequalities = [];
    relativePlacementConstraint.forEach(function(constraint){
      if(constraint.left) {
        gapInequalities.push({"axis": "x", "left": cy.getElementById(constraint.left), "right": cy.getElementById(constraint.right), "gap": 80});
      }
      else {
        gapInequalities.push({"axis": "y", "left": cy.getElementById(constraint.top), "right": cy.getElementById(constraint.bottom), "gap": 80});
      }
    });

    start = performance.now();
    cy.layout({name: 'cola', randomize: true, animate: false, fit: false, handleDisconnected: false, edgeLength: 50, convergenceThreshold: 0.01, unconstrIter: 10, userConstIter: 15, allConstIter: 20, 
        alignment: alignmentConstraint, gapInequalities: gapInequalities}).run();
    end = performance.now();
    cy.nodes().unlock();

    console.log("Cola finished!");

    graphProperties = cy.layvo("get").generalProperties();
    runtime[fileIndex][i+7] = Math.round((end - start) * 10 ) / 10;
    nodeOverlap[fileIndex][i+7] = graphProperties.numberOfNodeOverlaps - alreadyOverlapping;
    edgeCrossing[fileIndex][i+7] = graphProperties.numberOfEdgeCrosses;
    avgEdgeLength[fileIndex][i+7] = Math.round(graphProperties.averageEdgeLength * 10 ) / 10;
    totalArea[fileIndex][i+7] = Math.round(graphProperties.totalArea * 10 ) / 10;

    console.log("Cola evaluation finished!");
  }
  //results += ',';      

  console.log("File " + fileIndex + " - " + file + " - " + " has finished!");    

  if(fileIndex == files.length - 1) {

    let runtimeResult = "";
    let nodeOverlapResult = "";
    let edgeCrossingResult = "";
    let avgEdgeLengthResult = "";
    let totalAreaResult = "";

    for(let i = 0; i < numberOfFiles; i++) {
      for(let j = 0; j < 12; j++) {
        runtimeResult += runtime[i][j] + ",";
        nodeOverlapResult += nodeOverlap[i][j] + ",";
        edgeCrossingResult += edgeCrossing[i][j] + ",";
        avgEdgeLengthResult += avgEdgeLength[i][j] + ",";
        totalAreaResult += totalArea[i][j] + ",";
      }

      runtimeResult += '\n'
      nodeOverlapResult += '\n'
      edgeCrossingResult += '\n'
      avgEdgeLengthResult += '\n'
      totalAreaResult += '\n'
    }

    fs.writeFile(toPathRuntime, runtimeResult, function (err) {
      if (err) return console.log(err);
    });
    fs.writeFile(toPathNodeOverlap, nodeOverlapResult, function (err) {
      if (err) return console.log(err);
    });
    fs.writeFile(toPathEdgeCrossing, edgeCrossingResult, function (err) {
      if (err) return console.log(err);
    });
    fs.writeFile(toPathAvgEdgeLength, avgEdgeLengthResult, function (err) {
      if (err) return console.log(err);
    });
    fs.writeFile(toPathTotalArea, totalAreaResult, function (err) {
      if (err) return console.log(err);
    });
    console.log("END");                               
  }   
});

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function isCLRF(source) {
  let temp = source.indexOf('\n');
  if (source[temp - 1] === '\r')
    return true;
  return false;
}

// calculate number of already overlapping fixed nodes
function findNumberOfOverlappingFixedNodes(cy, fixedNodeSet) {
  let doesOverlap = function(node, otherNode) {
    let bb = node.boundingBox({includeLabels: false, includeOverlays: false}), bbOther = otherNode.boundingBox({includeLabels: false, includeOverlays: false});
    return !(bbOther.x1 > bb.x2 || bbOther.x2 < bb.x1 || bbOther.y1 > bb.y2 || bbOther.y2 < bb.y1);
  };

  let overlaps = 0;
  let nodeArray = [...fixedNodeSet];

  for (let i = 0; i < nodeArray.length; i++) {
    let node = cy.getElementById(nodeArray[i]);
    for (let j = i + 1; j < nodeArray.length; j++) {
      let otherNode = cy.getElementById(nodeArray[j]);
      if (!node.ancestors().union(node.descendants()).contains(otherNode) && doesOverlap(node, otherNode)) {
        overlaps++;
      }
    }
  }
  return overlaps;
}
