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
let toPathRuntime = path.join(moveTo, "fcose_cola_alignment_runtime_" + ratio + ".csv");
let toPathNodeOverlap = path.join(moveTo, "fcose_cola_alignment_node_overlap_" + ratio + ".csv");
let toPathEdgeCrossing = path.join(moveTo, "fcose_cola_alignment_edge_crossing_" + ratio + ".csv");
let toPathAvgEdgeLength = path.join(moveTo, "fcose_cola_alignment_avg_edge_length_" + ratio + ".csv");
let toPathTotalArea = path.join(moveTo, "fcose_cola_alignment_total_area_" + ratio + ".csv");

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
    let alignmentConstraint = {};      

    let numberOfSimpleNodes = cy.nodes().not(':parent').length;
    //let ratio = parseInt(document.getElementById("alignedNodeRatio").value);
    let maxAlignedNodes = Math.ceil(numberOfSimpleNodes * ratio / 100);
    let simpleNodes = cy.nodes().not(':parent');
    let processedNodeIds = new Set();
    let alignments = [];        

    let indexArray = Array.from(Array(numberOfSimpleNodes).keys());
    const shuffled = shuffle(indexArray);

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
            alignments.push([randomNode.id(), neighbor.id()]);
            processedNodeIds.add(randomNode.id());
            processedNodeIds.add(neighbor.id());
            randomNode.select();
            neighbor.select();
            count += 2;
          }
          else {
            alignments.forEach(function(array){
              array.forEach(function(nodeId){
               if(nodeId == neighbor.id()) {
                 array.push(randomNode.id());
                 processedNodeIds.add(randomNode.id());
                 randomNode.select();
                 count ++;
               } 
              });
            });
          }
        }
      }
      index++;
    }

    alignments.forEach(function(array){
      let randomDirection = Math.floor(Math.random() * 2); // 0 for horizontal 1 for vertical
      if(randomDirection) {
        if(alignmentConstraint.vertical) {
          alignmentConstraint.vertical.push(array);
        }
        else {
          alignmentConstraint.vertical = [array];
        }
      }
      else {
        if(alignmentConstraint.horizontal) {
          alignmentConstraint.horizontal.push(array);
        }
        else {
          alignmentConstraint.horizontal = [array];
        }              
      }
    });

    let start = performance.now();
    cy.layout({name: 'fcose', quality: 'default', step: 'all', packComponents: false, animate: false, alignmentConstraint: (alignmentConstraint.vertical || alignmentConstraint.horizontal) ? alignmentConstraint : undefined}).run(); 
    let end = performance.now();

    let graphProperties = cy.layvo("get").generalProperties();
    runtime[fileIndex][i+1] = Math.round((end - start) * 10 ) / 10;
    nodeOverlap[fileIndex][i+1] = graphProperties.numberOfNodeOverlaps;
    edgeCrossing[fileIndex][i+1] = graphProperties.numberOfEdgeCrosses;
    avgEdgeLength[fileIndex][i+1] = Math.round(graphProperties.averageEdgeLength * 10 ) / 10;
    totalArea[fileIndex][i+1] = Math.round(graphProperties.totalArea * 10 ) / 10;

	console.log("fCoSE has finished!");

    start = performance.now();
    cy.layout({name: 'cola', randomize: true, animate: false, handleDisconnected: false, edgeLength: 50, unconstrIter: 10, userConstIter: 15, allConstIter: 20, alignment: alignmentConstraint}).run();
    end = performance.now();

    graphProperties = cy.layvo("get").generalProperties();
    runtime[fileIndex][i+7] = Math.round((end - start) * 10 ) / 10;
    nodeOverlap[fileIndex][i+7] = graphProperties.numberOfNodeOverlaps;
    edgeCrossing[fileIndex][i+7] = graphProperties.numberOfEdgeCrosses;
    avgEdgeLength[fileIndex][i+7] = Math.round(graphProperties.averageEdgeLength * 10 ) / 10;
    totalArea[fileIndex][i+7] = Math.round(graphProperties.totalArea * 10 ) / 10;

    console.log("Cola has finished!");

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
