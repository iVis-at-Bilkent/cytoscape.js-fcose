/**
  The implementation of the fcose layout algorithm
*/

const assign = require('../assign');
const aux = require('./auxiliary');
const { spectralLayout } = require('./spectral');
const { coseLayout } = require('./cose');

const defaults = Object.freeze({
  
  // 'draft', 'default' or 'proof' 
  // - 'draft' only applies spectral layout 
  // - 'default' improves the quality with subsequent CoSE layout (fast cooling rate)
  // - 'proof' improves the quality with subsequent CoSE layout (slow cooling rate) 
  quality: "default",
  // use random node positions at beginning of layout
  // if this is set to false, then quality option must be "proof"
  randomize: true, 
  // whether or not to animate the layout
  animate: true, 
  // duration of animation in ms, if enabled
  animationDuration: 1000, 
  // easing of animation, if enabled
  animationEasing: undefined, 
  // fit the viewport to the repositioned nodes
  fit: true, 
  // padding around layout
  padding: 10,
  // whether to include labels in node dimensions. Valid in "proof" quality
  nodeDimensionsIncludeLabels: false,
  // whether to pack disconnected components - valid only if randomize: true
  packComponents: true,
  
  /* spectral layout options */
  
  // false for random, true for greedy
  samplingType: true,
  // sample size to construct distance matrix
  sampleSize: 25,
  // separation amount between nodes
  nodeSeparation: 75,
  // power iteration tolerance
  piTol: 0.0000001,
  
  /* CoSE layout options */
  
  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: 4500,
  // Ideal edge (non nested) length
  idealEdgeLength: 50,
  // Divisor to compute edge forces
  edgeElasticity: 0.45,
  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 0.1,
  // Gravity force (constant)
  gravity: 0.25,
  // Maximum number of iterations to perform
  numIter: 2500,
  // For enabling tiling
  tile: true,  
  // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingVertical: 10,
  // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8, 
  // Initial cooling factor for incremental layout  
  initialEnergyOnIncremental: 0.3,  

  /* layout event callbacks */
  ready: () => {}, // on layoutready
  stop: () => {} // on layoutstop
});

class Layout {
  constructor( options ){
    this.options = assign( {}, defaults, options );
  }

  run(){
    let layout = this;
    let options = this.options;
    let cy = options.cy;
    let eles = options.eles;
   
    let spectralResult = [];
    let xCoords;
    let yCoords;
    let coseResult = [];
    let components;

    let layUtil;
    let packingEnabled = false;
    if(cy.layoutUtilities && options.packComponents && options.randomize){
      layUtil = cy.layoutUtilities("get");
      if(!layUtil)
        layUtil = cy.layoutUtilities();
      packingEnabled = true;
    }

    if(options.eles.length == 0)
      return;

    if(options.eles.length != options.cy.elements().length){
      let prevNodes = eles.nodes();
      eles = eles.union(eles.descendants());
      
      eles.forEach(function(ele){
        if(ele.isNode()){
          let connectedEdges = ele.connectedEdges();
          connectedEdges.forEach(function(edge){
            if(eles.contains(edge.source()) && eles.contains(edge.target()) && !prevNodes.contains(edge.source().union(edge.target()))){
              eles = eles.union(edge);
            }
          });
        }
      });

      options.eles = eles;
    }

    if(packingEnabled){
      let topMostNodes = aux.getTopMostNodes(options.eles.nodes());
      components = aux.connectComponents(cy, options.eles, topMostNodes);      
    }
      
    if(options.randomize){
      if(packingEnabled){
        components.forEach(function(component){
          options.eles = component;
          spectralResult.push(spectralLayout(options));
        });
      }
      else{
        // Apply spectral layout
        spectralResult.push(spectralLayout(options));
        if(spectralResult[0]){
          xCoords = spectralResult[0]["xCoords"];
          yCoords = spectralResult[0]["yCoords"];
        }
      }     
    }
    
    if(options.quality == "default" || options.quality == "proof" || spectralResult.includes(false)){  
      if(packingEnabled){
        if(options.quality == "draft" && spectralResult.includes(false)){
          spectralResult.forEach(function(value, index){
            if(!value){
              options.eles = components[index];
              let tempResult = coseLayout(options, spectralResult[index]);
              let nodeIndexes = new Map();
              let xCoords = [];
              let yCoords = [];
              let count = 0;
              Object.keys(tempResult).forEach(function (item) {
                nodeIndexes.set(item, count++);
                xCoords.push(tempResult[item].getCenterX());
                yCoords.push(tempResult[item].getCenterY());
              });
              spectralResult[index] = {nodeIndexes: nodeIndexes, xCoords: xCoords, yCoords: yCoords};
            }
          });
        }
        else{
          components.forEach(function(component, index){
            options.eles = component;
            coseResult.push(coseLayout(options, spectralResult[index]));          
          });
        }
      }
      else{
        // Apply cose layout as postprocessing
        coseResult.push(coseLayout(options, spectralResult[0]));
      }
    }
    
    if(packingEnabled){
      let subgraphs = [];  
      components.forEach(function(component, index){
        let nodeIndexes;
        if(options.quality == "draft"){
          nodeIndexes = spectralResult[index].nodeIndexes;
        }
        let subgraph = {};
        subgraph.nodes = [];
        subgraph.edges = [];
        let nodeIndex;
        component.nodes().forEach(function (node) {
          if(options.quality == "draft"){
            if(!node.isParent()){
              nodeIndex = nodeIndexes.get(node.id());
              subgraph.nodes.push({x: spectralResult[index].xCoords[nodeIndex] - node.bb().w/2, y: spectralResult[index].yCoords[nodeIndex] - node.bb().h/2, width: node.bb().w, height: node.bb().h});              
            }
            else{
              let parentInfo = aux.calcBoundingBox(node, spectralResult[index].xCoords, spectralResult[index].yCoords, nodeIndexes);
              subgraph.nodes.push({x: parentInfo.topLeftX, y: parentInfo.topLeftY, width: parentInfo.width, height: parentInfo.height}); 
            }   
          }
          else{
            subgraph.nodes.push({x: coseResult[index][node.id()].getLeft(), y: coseResult[index][node.id()].getTop(), width: coseResult[index][node.id()].getWidth(), height: coseResult[index][node.id()].getHeight()});
          }
        });
        subgraphs.push(subgraph);
      });
      let shiftResult = layUtil.packComponents(subgraphs).shifts;
      if(options.quality == "draft"){
        spectralResult.forEach(function(result, index){
          let newXCoords = result.xCoords.map(x => x + shiftResult[index].dx);
          let newYCoords = result.yCoords.map(y => y + shiftResult[index].dy);
          result.xCoords = newXCoords;
          result.yCoords = newYCoords;
        });
      }
      else{
        coseResult.forEach(function(result, index){
          Object.keys(result).forEach(function (item) {
            let nodeRectangle = result[item];
            nodeRectangle.setCenter(nodeRectangle.getCenterX() + shiftResult[index].dx, nodeRectangle.getCenterY() + shiftResult[index].dy);
          });
        });        
      }
    }
    
    // get each element's calculated position
    let getPositions = function(ele, i ){
      if(options.quality == "default" || options.quality == "proof" || (options.quality == "proof" && !packingEnabled && spectralResult.includes(false))) {
        if(typeof ele === "number") {
          ele = i;
        }
        let pos;
        let theId = ele.data('id');
        coseResult.forEach(function(result){
          if (theId in result){
            pos = {x: result[theId].getRect().getCenterX(), y: result[theId].getRect().getCenterY()};
          }
        });
        return {
          x: pos.x,
          y: pos.y
        };
      }
      else{
        let pos;
        spectralResult.forEach(function(result){
          let index = result.nodeIndexes.get(ele.id());
          if(index != undefined){
            pos = {x: result.xCoords[index], y: result.yCoords[index]};
          };
        });
        return {
          x: pos.x,
          y: pos.y
        };
      }
    }; 
    
    // quality = "draft" and randomize = false are contradictive so in that case positions don't change
    if((options.quality == "default" || options.quality == "proof") || options.randomize) {
      // transfer calculated positions to nodes (positions of only simple nodes are evaluated, compounds are positioned automatically)
      options.eles = eles;
      eles.nodes().not(":parent").layoutPositions(layout, options, getPositions); 
    }
    else{
      console.log("If randomize option is set to false, then quality option must be 'default' or 'proof'.");
    }
    
  }
}

module.exports = Layout;