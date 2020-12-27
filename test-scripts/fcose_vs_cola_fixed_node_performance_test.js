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
let ratio = process.argv[3]; // ratio of the constrained nodes to all nodes

let moveFrom = "./graphs";
let moveTo = "./results";
let toPathRuntime = path.join(moveTo, "fcose_cola_fixed_node_runtime_" + ratio + ".csv");
let toPathNodeOverlap = path.join(moveTo, "fcose_cola_fixed_node_node_overlap_" + ratio + ".csv");
let toPathEdgeCrossing = path.join(moveTo, "fcose_cola_fixed_node_edge_crossing_" + ratio + ".csv");
let toPathAvgEdgeLength = path.join(moveTo, "fcose_cola_fixed_node_avg_edge_length_" + ratio + ".csv");
let toPathTotalArea = path.join(moveTo, "fcose_cola_fixed_node_total_area_" + ratio + ".csv");

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

    cy.nodes().unselect();
    let fixedNodes = [];

    let fixedNodesSet = new Set();
    let numberOfSimpleNodes = cy.nodes().not(':parent').length;
    //let ratio = parseInt(document.getElementById("fixedNodeRatio").value);
    //let maxShift = parseInt(document.getElementById("maxNodeShift").value);
    let maxShift = 60;

    let indexArray = Array.from(Array(numberOfSimpleNodes).keys());
    const shuffled = shuffle(indexArray);
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

    let start = performance.now();
    cy.layout({name: 'fcose', quality: 'default', step: 'all', packComponents: false, animate: false, fit: false, fixedNodeConstraint: fixedNodes.length > 0 ? fixedNodes : undefined}).run();
    let end = performance.now();

    //console.log(graphProperties.numberOfNodeOverlaps  + "  " + alreadyOverlapping);
    let graphProperties = cy.layvo("get").generalProperties();
    runtime[fileIndex][i+1] = Math.round((end - start) * 10 ) / 10;
    nodeOverlap[fileIndex][i+1] = graphProperties.numberOfNodeOverlaps - alreadyOverlapping;
    edgeCrossing[fileIndex][i+1] = graphProperties.numberOfEdgeCrosses;
    avgEdgeLength[fileIndex][i+1] = Math.round(graphProperties.averageEdgeLength * 10 ) / 10;
    totalArea[fileIndex][i+1] = Math.round(graphProperties.totalArea * 10 ) / 10;

    fixedNodes.forEach(function(constraint){
      cy.getElementById(constraint.nodeId).lock();
    });

    start = performance.now();
    cy.layout({name: 'cola', randomize: true, animate: false, fit: false,  handleDisconnected: false, edgeLength: 50, unconstrIter: 10, userConstIter: 15, allConstIter: 20}).run();
    end = performance.now();
    cy.nodes().unlock();

    graphProperties = cy.layvo("get").generalProperties();
    runtime[fileIndex][i+7] = Math.round((end - start) * 10 ) / 10;
    nodeOverlap[fileIndex][i+7] = graphProperties.numberOfNodeOverlaps - alreadyOverlapping;
    edgeCrossing[fileIndex][i+7] = graphProperties.numberOfEdgeCrosses;
    avgEdgeLength[fileIndex][i+7] = Math.round(graphProperties.averageEdgeLength * 10 ) / 10;
    totalArea[fileIndex][i+7] = Math.round(graphProperties.totalArea * 10 ) / 10;

  }
  //results += ',';
  
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

  console.log("File " + fileIndex + " - " + file + " - " + " has finished!");      

  if(fileIndex == files.length - 1) {
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
