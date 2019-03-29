/**
  The implementation of the postprocessing part that applies CoSE layout over the spectral layout
*/

const CoSELayout = require('cose-base').CoSELayout;
const CoSENode = require('cose-base').CoSENode;
const PointD = require('cose-base').layoutBase.PointD;
const DimensionD = require('cose-base').layoutBase.DimensionD;
const LayoutConstants = require('cose-base').layoutBase.LayoutConstants;
const FDLayoutConstants = require('cose-base').layoutBase.FDLayoutConstants;
const CoSEConstants = require('cose-base').CoSEConstants;

// main function that cose layout is processed
let coseLayout = function(options, spectralResult){
  
  let eles = options.eles;
  let nodes = eles.nodes();
  let edges = eles.edges();
  
  let nodeIndexes;
  let xCoords;
  let yCoords;
  let idToLNode =  {};  
  
  if(options.randomize){
    nodeIndexes = spectralResult["nodeIndexes"];
    xCoords = spectralResult["xCoords"];
    yCoords = spectralResult["yCoords"];
  }

  /**** Postprocessing functions ****/

  // get the top most nodes
  let getTopMostNodes = function(nodes) {
    let nodesMap = {};
    for (let i = 0; i < nodes.length; i++) {
        nodesMap[nodes[i].id()] = true;
    }
    let roots = nodes.filter(function (ele, i) {
        if(typeof ele === "number") {
          ele = i;
        }
        let parent = ele.parent()[0];
        while(parent != null){
          if(nodesMap[parent.id()]){
            return false;
          }
          parent = parent.parent()[0];
        }
        return true;
    });

    return roots;
  };

  // transfer cytoscape nodes to cose nodes
  let processChildrenList = function (parent, children, layout, options) {
    let size = children.length;
    for (let i = 0; i < size; i++) {
      let theChild = children[i];
      let children_of_children = theChild.children();
      let theNode;    

      let dimensions = theChild.layoutDimensions({
        nodeDimensionsIncludeLabels: options.nodeDimensionsIncludeLabels
      });

      if (theChild.outerWidth() != null
              && theChild.outerHeight() != null) {
        if(options.randomize){
          if(!theChild.isParent()){
            theNode = parent.add(new CoSENode(layout.graphManager,
                    new PointD(xCoords[nodeIndexes.get(theChild.id())] - dimensions.w / 2, yCoords[nodeIndexes.get(theChild.id())] - dimensions.h / 2),
                    new DimensionD(parseFloat(dimensions.w), parseFloat(dimensions.h))));
          }
          else{
            let parentInfo = calcBoundingBox(theChild);
            theNode = parent.add(new CoSENode(layout.graphManager,
                    new PointD(parentInfo.topLeftX, parentInfo.topLeftY),
                    new DimensionD(parentInfo.width, parentInfo.height)));
          }
        }
        else{
          theNode = parent.add(new CoSENode(layout.graphManager,
                  new PointD(theChild.position('x') - dimensions.w / 2, theChild.position('y') - dimensions.h / 2),
                  new DimensionD(parseFloat(dimensions.w), parseFloat(dimensions.h))));        
        }
      }
      else {
        theNode = parent.add(new CoSENode(this.graphManager));
      }
      // Attach id to the layout node
      theNode.id = theChild.data("id");
      // Attach the paddings of cy node to layout node
      theNode.paddingLeft = parseInt( theChild.css('padding') );
      theNode.paddingTop = parseInt( theChild.css('padding') );
      theNode.paddingRight = parseInt( theChild.css('padding') );
      theNode.paddingBottom = parseInt( theChild.css('padding') );

      //Attach the label properties to compound if labels will be included in node dimensions  
      if(options.nodeDimensionsIncludeLabels){
        if(theChild.isParent()){
          let labelWidth = theChild.boundingBox({ includeLabels: true, includeNodes: false }).w;          
          let labelHeight = theChild.boundingBox({ includeLabels: true, includeNodes: false }).h;
          let labelPos = theChild.css("text-halign");
          theNode.labelWidth = labelWidth;
          theNode.labelHeight = labelHeight;
          theNode.labelPos = labelPos;          
        }
      }

      // Map the layout node
      idToLNode[theChild.data("id")] = theNode;

      if (isNaN(theNode.rect.x)) {
        theNode.rect.x = 0;
      }

      if (isNaN(theNode.rect.y)) {
        theNode.rect.y = 0;
      }

      if (children_of_children != null && children_of_children.length > 0) {
        let theNewGraph;
        theNewGraph = layout.getGraphManager().add(layout.newGraph(), theNode);
        processChildrenList(theNewGraph, children_of_children, layout, options);
      }
    }
    function calcBoundingBox(parentNode){
        // calculate bounds
        let left = Number.MAX_VALUE;
        let right = Number.MIN_VALUE;
        let top = Number.MAX_VALUE;
        let bottom = Number.MIN_VALUE;
        let nodeLeft;
        let nodeRight;
        let nodeTop;
        let nodeBottom;

        let nodes = parentNode.descendants().not(":parent");
        let s = nodes.length;
        for (let i = 0; i < s; i++)
        {
          let node = nodes[i];

          nodeLeft = xCoords[nodeIndexes.get(node.id())] - node.width()/2;
          nodeRight = xCoords[nodeIndexes.get(node.id())] + node.width()/2;
          nodeTop = yCoords[nodeIndexes.get(node.id())] - node.height()/2;
          nodeBottom = yCoords[nodeIndexes.get(node.id())] + node.height()/2;

          if (left > nodeLeft)
          {
            left = nodeLeft;
          }

          if (right < nodeRight)
          {
            right = nodeRight;
          }

          if (top > nodeTop)
          {
            top = nodeTop;
          }

          if (bottom < nodeBottom)
          {
            bottom = nodeBottom;
          }
        }

        let boundingBox = {};
        boundingBox.topLeftX = left;
        boundingBox.topLeftY = top;
        boundingBox.width = right - left;
        boundingBox.height = top - bottom;
        return boundingBox;
    }
  };   

  // transfer cytoscape edges to cose edges
  let processEdges = function(layout, gm, edges){
    for (let i = 0; i < edges.length; i++) {
      let edge = edges[i];
      let sourceNode = idToLNode[edge.data("source")];
      let targetNode = idToLNode[edge.data("target")];
      if(sourceNode !== targetNode && sourceNode.getEdgesBetween(targetNode).length == 0){
        let e1 = gm.add(layout.newEdge(), sourceNode, targetNode);
        e1.id = edge.id();
      }
    }
  };   
  
  /**** Apply postprocessing ****/
  
  if(options.quality == "proof"){  
    
    if (options.nodeRepulsion != null)
      CoSEConstants.DEFAULT_REPULSION_STRENGTH = FDLayoutConstants.DEFAULT_REPULSION_STRENGTH = options.nodeRepulsion;
    if (options.idealEdgeLength != null)
      CoSEConstants.DEFAULT_EDGE_LENGTH = FDLayoutConstants.DEFAULT_EDGE_LENGTH = options.idealEdgeLength;
    if (options.edgeElasticity != null)
      CoSEConstants.DEFAULT_SPRING_STRENGTH = FDLayoutConstants.DEFAULT_SPRING_STRENGTH = options.edgeElasticity;
    if (options.nestingFactor != null)
      CoSEConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = FDLayoutConstants.PER_LEVEL_IDEAL_EDGE_LENGTH_FACTOR = options.nestingFactor;
    if (options.gravity != null)
      CoSEConstants.DEFAULT_GRAVITY_STRENGTH = FDLayoutConstants.DEFAULT_GRAVITY_STRENGTH = options.gravity;
    if (options.numIter != null)
      CoSEConstants.MAX_ITERATIONS = FDLayoutConstants.MAX_ITERATIONS = options.numIter;
    if (options.gravityRange != null)
      CoSEConstants.DEFAULT_GRAVITY_RANGE_FACTOR = FDLayoutConstants.DEFAULT_GRAVITY_RANGE_FACTOR = options.gravityRange;
    if(options.gravityCompound != null)
      CoSEConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_STRENGTH = options.gravityCompound;
    if(options.gravityRangeCompound != null)
      CoSEConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = FDLayoutConstants.DEFAULT_COMPOUND_GRAVITY_RANGE_FACTOR = options.gravityRangeCompound;
    if (options.initialEnergyOnIncremental != null)
      CoSEConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL = options.initialEnergyOnIncremental;

    CoSEConstants.NODE_DIMENSIONS_INCLUDE_LABELS = FDLayoutConstants.NODE_DIMENSIONS_INCLUDE_LABELS = LayoutConstants.NODE_DIMENSIONS_INCLUDE_LABELS = options.nodeDimensionsIncludeLabels;
    CoSEConstants.DEFAULT_INCREMENTAL = FDLayoutConstants.DEFAULT_INCREMENTAL = LayoutConstants.DEFAULT_INCREMENTAL =
            !(options.randomize);
    CoSEConstants.ANIMATE = FDLayoutConstants.ANIMATE = LayoutConstants.ANIMATE = options.animate;
    CoSEConstants.TILE = options.tile;
    CoSEConstants.TILING_PADDING_VERTICAL = 
            typeof options.tilingPaddingVertical === 'function' ? options.tilingPaddingVertical.call() : options.tilingPaddingVertical;
    CoSEConstants.TILING_PADDING_HORIZONTAL = 
            typeof options.tilingPaddingHorizontal === 'function' ? options.tilingPaddingHorizontal.call() : options.tilingPaddingHorizontal;  

    CoSEConstants.DEFAULT_INCREMENTAL = FDLayoutConstants.DEFAULT_INCREMENTAL = LayoutConstants.DEFAULT_INCREMENTAL = true;

    let coseLayout = new CoSELayout();
    let gm = coseLayout.newGraphManager(); 

    processChildrenList(gm.addRoot(), getTopMostNodes(nodes), coseLayout, options);

    processEdges(coseLayout, gm, edges);

    coseLayout.runLayout();
  }
  
  return idToLNode;
};

module.exports = { coseLayout };
