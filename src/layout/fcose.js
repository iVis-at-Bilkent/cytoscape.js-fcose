// n.b. .layoutPositions() handles all these options for you

const assign = require('../assign');
const aux = require('./auxiliary');
const numeric = require('numeric');
const CoSELayout = require('cose-base').CoSELayout;
const CoSENode = require('cose-base').CoSENode;
const PointD = require('cose-base').layoutBase.PointD;
const DimensionD = require('cose-base').layoutBase.DimensionD;
const LayoutConstants = require('cose-base').layoutBase.LayoutConstants;
const FDLayoutConstants = require('cose-base').layoutBase.FDLayoutConstants;
const CoSEConstants = require('cose-base').CoSEConstants;
const LinkedList = require('cose-base').layoutBase.LinkedList;

const defaults = Object.freeze({
  
  // CMDS options
  postProcessing: true,
  initialEnergyOnIncremental: 0.2,
  
  // animation
  animate: true, // whether or not to animate the layout
  animationDuration: 1000, // duration of animation in ms, if enabled
  animationEasing: undefined, // easing of animation, if enabled
  animateFilter: ( node, i ) => true, // whether to animate specific nodes when animation is on; non-animated nodes immediately go to their final positions

  // viewport
  pan: undefined, // pan the graph to the provided position, given as { x, y }
  zoom: undefined, // zoom level as a positive number to set after animation
  fit: true, // fit the viewport to the repositioned nodes, overrides pan and zoom

  // modifications
  padding: undefined, // padding around layout
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  spacingFactor: undefined, // a positive value which adjusts spacing between nodes (>1 means greater than usual spacing)
  nodeDimensionsIncludeLabels: undefined, // whether labels should be included in determining the space used by a node (default true)
  transform: ( node, pos ) => pos, // a function that applies a transform to the final node position

  // layout event callbacks
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
    let nodes = eles.nodes();
    let edges = eles.edges();
    let nodeSize = nodes.length;
    
    let dummyNodes = new Map();  // map to keep dummy nodes and their neighbors
    let nodeIndexes = new Map();  // map to keep indexes to nodes
    let parentChildMap = new Map(); // mapping btw. compound and its representative node 
    let allNodesNeighborhood = []; // array to keep neighborhood of all nodes
    let xCoords = [];
    let yCoords = [];
    
    let samplesColumn = [];   // sampled vertices
    let minDistancesColumn = [];
    let C = [];   // column sampling matrix
    let PHI = [];   // intersection of column and row sampling matrices 
    let INV = [];   // inverse of PHI 
    
    let firstSample;    // the first sampled node
    
    const infinity = 100000000;
    const small = 0.000000001;
    let piTol = 0.0000001;
    let sampleSize = 25;
    let samplingType = 1;   // 0 for random, 1 for greedy
    
    /**** Preprocessing functions ****/
    
    // get the top most nodes - this function is used in both pre- and post-processing
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
    
    // find disconnected components and create dummy nodes that connect them
    let connectComponents = function(topMostNodes){      
      let queue = new LinkedList();
      let visited = new Set();
      let visitedTopMostNodes;
      let currentNeighbor;
      
      let isConnected = false;
      let count = 1;
      let nodesConnectedToDummy = [];
      
      do{
        let currentNode = topMostNodes[0];
        let childrenOfCurrentNode = currentNode.union(currentNode.descendants());
        visitedTopMostNodes = currentNode;

        childrenOfCurrentNode.forEach(function(node) {
          queue.push(node);
          visited.add(node);
        });

        while(queue.length != 0){
          currentNode = queue.shift();

          // Traverse all neighbors of this node
          let neighborNodes = currentNode.neighborhood().nodes();
          for(let i = 0; i < neighborNodes.length; i++){
            let neighborNode = neighborNodes[i];
            currentNeighbor = topMostNodes.intersection(neighborNode.union(neighborNode.ancestors()));
            if(currentNeighbor != null && !visited.has(currentNeighbor[0])){
              let childrenOfNeighbor = currentNeighbor.union(currentNeighbor.descendants());

              childrenOfNeighbor.forEach(function(node){
                queue.push(node);
                visited.add(node);
                if(topMostNodes.has(node)){
                  visitedTopMostNodes = visitedTopMostNodes.union(node);
                }
              });
            }
          }
        }

        if(visitedTopMostNodes.length == topMostNodes.length){
          isConnected = true;
        }
        
        if(!isConnected || (isConnected && count > 1)){
          nodesConnectedToDummy.push(topMostNodes[0].id());
          topMostNodes = topMostNodes.difference(visitedTopMostNodes);
          count++;
        }
        
      }
      while(!isConnected);
      
      if(nodesConnectedToDummy.length > 0 ){
          dummyNodes.set('dummy'+(dummyNodes.size+1), nodesConnectedToDummy);
      }
    };

    /**** Spectral layout functions ****/
    
    // determine which columns to be sampled
    let randomSampleCR = function() {
      let sample = 0;
      let count = 0;
      let flag = false;

      while(count < sampleSize){
        sample = Math.floor(Math.random() * nodeSize); 
       
        flag = false;
        for(let i = 0; i < count; i++){
          if(samplesColumn[i] == sample){
            flag = true;
            break;
          }
        }
        
        if(!flag){
          samplesColumn[count] = sample;
          count++;
        }
        else{
          continue;
        }
      }    
    };
    
    // takes the index of the node(pivot) to initiate BFS as a parameter
    let BFS = function(pivot, index, samplingMethod){
      let path = [];    // the front of the path
      let front = 0;    // the back of the path
      let back = 0;
      let current = 0;
      let temp;
      let distance = [];
      
      let max_dist = 0;    // the furthest node to be returned
      let max_ind = 1;
      
      for(let i = 0; i < nodeSize; i++){
        distance[i] = infinity;
      }
      
      path[back] = pivot;
      distance[pivot] = 0;
      
      while(back >= front){
        current = path[front++];
        let neighbors = allNodesNeighborhood[current];
        for(let i = 0; i < neighbors.length; i++){
          temp = nodeIndexes.get(neighbors[i]);
          if(distance[temp] == infinity){
            distance[temp] = distance[current] + 1;
            path[++back] = temp;
          }
        }        
        C[current][index] = distance[current] * 75;       
      }
      
      if(samplingMethod == 1){
        for(let i = 0; i < nodeSize; i++){
          if(C[i][index] < minDistancesColumn[i])
            minDistancesColumn[i] = C[i][index];
        }

        for(let i = 0; i < nodeSize; i++){
          if(minDistancesColumn[i] > max_dist ){
            max_dist = minDistancesColumn[i];
            max_ind = i;

          }
        }            
      }
      return max_ind;
    };

    //  apply BFS to all nodes or selected samples
    let allBFS = function(samplingMethod){
      
      let sample;

      if(samplingMethod == 0){
        randomSampleCR();

        // call BFS
        for(let i = 0; i < sampleSize; i++){
          BFS(samplesColumn[i], i, samplingMethod, false);
        }          
      }
      else{
        sample = Math.floor(Math.random() * nodeSize);
        firstSample = sample;

        for(let i = 0; i < nodeSize; i++){
          minDistancesColumn[i] = infinity;
        } 

        for(let i = 0; i < sampleSize; i++){
          samplesColumn[i] = sample;
          sample = BFS(sample, i, samplingMethod);
        } 

      }

      // form the squared distances for C
      for(let i = 0; i < nodeSize; i++){
        for(let j = 0; j < sampleSize; j++){
          C[i][j] *= C[i][j];  
        }
      }

      // form PHI
      for(let i = 0; i < sampleSize; i++){
        PHI[i] = [];  
      }

      for(let i = 0; i < sampleSize; i++){
        for(let j = 0; j < sampleSize; j++){
          PHI[i][j] = C[samplesColumn[j]][i];  
        }
      }        
    };
    
    // perform the SVD algorithm and apply a regularization step)
    let sample = function(){
      
      let SVDResult = numeric.svd(PHI);

      let a_w = SVDResult.S;
      let a_u = SVDResult.U;
      let a_v = SVDResult.V;        
      
      let max_s = a_w[0]*a_w[0]*a_w[0];
      
      let a_Sig = [];
     
      //  regularization
      for(let i = 0; i < sampleSize; i++){
        a_Sig[i] = [];
        for(let j = 0; j < sampleSize; j++){
          a_Sig[i][j] = 0;
          if(i == j){
            a_Sig[i][j] = a_w[i]/(a_w[i]*a_w[i] + max_s/(a_w[i]*a_w[i]));
          }
        }
      }
      
      INV = aux.multMat(aux.multMat(a_v, a_Sig), numeric.transpose(a_u));
        
    };
    
    let powerIteration = function(){
      // two largest eigenvalues
      let theta1; 
      let theta2;
      
      // initial guesses for eigenvectors
      let Y1 = [];
      let Y2 = [];
      
      let V1 = [];
      let V2 = [];      
      
      for(let i = 0; i < nodeSize; i++){
        Y1[i] = Math.random();
        Y2[i] = Math.random();
      }
      
      Y1 = aux.normalize(Y1);
      Y2 = aux.normalize(Y2);
      
      let count = 0;
      // to keep track of the improvement ratio in power iteration
      let current = small; 
      let previous = small;
      
      let temp;
      
      while(true){
        count++;
        
        for(let i = 0; i < nodeSize; i++){
          V1[i] = Y1[i];
        }

        Y1 = aux.multGamma(aux.multL(aux.multGamma(V1), C, INV));
        theta1 = aux.dotProduct(V1, Y1);
        Y1 = aux.normalize(Y1);
        
        current = aux.dotProduct(V1, Y1);
        
        temp = Math.abs(current/previous);
        
        if(temp < 1 + piTol && temp > 1){
          break;
        }
        
        previous = current;        
      }
      
      for(let i = 0; i < nodeSize; i++){
        V1[i] = Y1[i];
      }

      count = 0;
      previous = small;
      while(true){
        count++;
        
        for(let i = 0; i < nodeSize; i++){
          V2[i] = Y2[i];
        }
        
        V2 = aux.minusOp(V2, aux.multCons(V1, (aux.dotProduct(V1, V2))));
        Y2 = aux.multGamma(aux.multL(aux.multGamma(V2), C, INV));
        theta2 = aux.dotProduct(V2, Y2);
        Y2 = aux.normalize(Y2);
        
        current = aux.dotProduct(V2, Y2);
        
        temp = Math.abs(current/previous);
        
        if(temp < 1 + piTol && temp > 1){
          break;
        }
        
        previous = current;        
      }
      
      for(let i = 0; i < nodeSize; i++){
        V2[i] = Y2[i];
      }

      // theta1 now contains dominant eigenvalue
      // theta2 now contains the second-largest eigenvalue
      // V1 now contains theta1's eigenvector
      // V2 now contains theta2's eigenvector
      
      //populate the two vectors
      xCoords = aux.multCons(V1, Math.sqrt(Math.abs(theta1)));
      yCoords = aux.multCons(V2, Math.sqrt(Math.abs(theta2)));

    };
    
    /**** Postprocessing functions ****/
    
    let processChildrenList = function (parent, children, layout) {
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
          if(!theChild.isParent()){
            theNode = parent.add(new CoSENode(layout.graphManager,
                    new PointD(xCoords[nodeIndexes.get(theChild.id())] - dimensions.w / 2, yCoords[nodeIndexes.get(theChild.id())] - dimensions.h / 2),
                    new DimensionD(parseFloat(dimensions.w), parseFloat(dimensions.h))));
          }
          else{
            theNode = parent.add(new CoSENode(layout.graphManager,
                    new PointD(theChild.boundingBox().x1, theChild.boundingBox().y1),
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
          processChildrenList(theNewGraph, children_of_children, layout);
        }
      }
    };   

    let processEdges = function(layout){
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
    
    /**** Preparation for spectral layout (Preprocessing) ****/
    
    let spectral = performance.now();
    
    // connect disconnected components (first top level, then inside of each compound node)
    connectComponents(getTopMostNodes(nodes));
    
    cy.nodes(":parent").forEach(function( ele ){
      connectComponents(getTopMostNodes(ele.descendants()));
    });
    
    // assign indexes to nodes (first real, then dummy nodes)
    let index = 0;
    for(let i = 0; i < nodes.length; i++){
      if(!nodes[i].isParent()){
        nodeIndexes.set(nodes[i].id(), index++);
      }
    }    
    
    for (let key of dummyNodes.keys()) {
      nodeIndexes.set(key, index++);
    }
    
    // instantiate the neighborhood matrix
    for(let i = 0; i < nodeIndexes.size; i++){
      allNodesNeighborhood[i] = [];
    } 
            
    // form a parent-child map to keep representative node of each compound node  
    cy.nodes(":parent").forEach(function( ele ){
      let children = ele.children();
      
      let random = 0;
      while(children.nodes(":childless").length == 0){
        random = Math.floor(Math.random() * children.nodes().length); // if all children are compound then proceed randomly
        children = children.nodes()[0].children();
      }
      //  select the representative node - we can apply different methods here
//      random = Math.floor(Math.random() * children.nodes(":childless").length);
      let index = 0;
      let min = 1000;
      children.nodes(":childless").forEach(function(ele2, i){
        if(ele2.connectedEdges().length < min){
          min = ele2.connectedEdges().length;
          index = i;
        }
      });
      parentChildMap.set(ele.id(), children.nodes(":childless")[index].id());
    }); 
    
    // add neighborhood relations (first real, then dummy nodes)
    cy.nodes().forEach(function( ele ){
      let eleIndex;
      
      if(ele.isParent())
        eleIndex = nodeIndexes.get(parentChildMap.get(ele.id()));
      else
        eleIndex = nodeIndexes.get(ele.id());

      ele.neighborhood().nodes().forEach(function(node){
        if(node.isParent())
          allNodesNeighborhood[eleIndex].push(parentChildMap.get(node.id()));       
        else
          allNodesNeighborhood[eleIndex].push(node.id());          
      });
    });
    
    for (let key of dummyNodes.keys()) {
      let eleIndex = nodeIndexes.get(key);
      let disconnectedId;
      dummyNodes.get(key).forEach(function(id){
        if(cy.getElementById(id).isParent())
          disconnectedId = parentChildMap.get(id);
        else
          disconnectedId = id;
          
        allNodesNeighborhood[eleIndex].push(disconnectedId);
        allNodesNeighborhood[nodeIndexes.get(disconnectedId)].push(key);
      });
    }
    
//    // assign indexes to nodes
//    let index = 0;
//    for(let i = 0; i < nodes.length; i++){
//      if(!nodes[i].isParent()){
//        nodeIndexes.set(nodes[i].id(), index);
//        allNodesNeighborhood[index++] = nodes[i].neighborhood().nodes().not(":parent"); //  form neighborhood for simple nodes
//      }
//    }

//    // add neighborhood relations of compound nodes
//    cy.nodes(":parent").forEach(function( ele ){
//      //  first add neighbors to representative node
//      allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele.id()).id())] = allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele.id()).id())].union(ele.neighborhood().nodes().not(":parent"));
//      ele.neighborhood().nodes(":parent").forEach(function(ele2, i){
//        allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele.id()).id())] = allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele.id()).id())].union(parentChildMap.get(ele2.id()));
//      });
//      //  then add representative node to neighbors
//      ele.neighborhood().nodes().not(":parent").forEach(function(ele3, i){
//        allNodesNeighborhood[nodeIndexes.get(ele3.id())] = allNodesNeighborhood[nodeIndexes.get(ele3.id())].union(parentChildMap.get(ele.id()));
//      });
//      ele.neighborhood().nodes(":parent").forEach(function(ele3, i){
//        allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele3.id()).id())] = allNodesNeighborhood[nodeIndexes.get(parentChildMap.get(ele3.id()).id())].union(parentChildMap.get(ele.id()));
//      });
//    });
    
    //  nodeSize now only considers the size of transformed graph
    nodeSize = nodeIndexes.size; 
    
    // instantiates the partial matrices that will be used in spectral layout
    for(let i = 0; i < nodeSize; i++){
      C[i] = [];
    }
    for(let i = 0; i < sampleSize; i++){
      INV[i] = [];
    } 
    
    /**** Apply spectral layout ****/

    allBFS(samplingType);  
    sample();
    powerIteration();
    
    spectral = performance.now() - spectral; 
    
    /**** Apply postprocessing ****/
    
    let cose = performance.now();
    
    let idToLNode =  {};
    let coseLayout = new CoSELayout();
    let gm = coseLayout.newGraphManager(); 
    
    CoSEConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL = FDLayoutConstants.DEFAULT_COOLING_FACTOR_INCREMENTAL = options.initialEnergyOnIncremental;
    CoSEConstants.DEFAULT_INCREMENTAL = FDLayoutConstants.DEFAULT_INCREMENTAL = LayoutConstants.DEFAULT_INCREMENTAL = true;
    
    if(options.postProcessing){

      processChildrenList(gm.addRoot(), getTopMostNodes(nodes), coseLayout);

      processEdges(coseLayout);

      coseLayout.runLayout();
    }
    
    cose = performance.now() - cose;
    
    /**** Transfer final positions to cytoscape ****/
    
    // get each element's calculated position
    let getPositions = function(ele, i ){
      if(options.postProcessing) {
        if(typeof ele === "number") {
          ele = i;
        }
        let theId = ele.data('id');
        let lNode = idToLNode[theId];

        return {
          x: lNode.getRect().getCenterX(),
          y: lNode.getRect().getCenterY()
        };
      }
      else{
        return {
          x: xCoords[i],
          y: yCoords[i]
        };
      }
    }; 
    
    // transfer calculated positions to nodes (positions of only simple nodes are evaluated, compounds are positioned automatically)
    nodes.not(":parent").layoutPositions(layout, options, getPositions);    
    
    document.getElementById("spectral").innerHTML = Math.floor(spectral) + " ms";
    if(options.postProcessing){
      document.getElementById("cose").innerHTML = Math.floor(cose) + " ms";
      document.getElementById("total").innerHTML = Math.floor(spectral + cose) + " ms";
    }
    else{
      document.getElementById("cose").innerHTML = "N/A";
      document.getElementById("total").innerHTML = Math.floor(spectral) + " ms";
    }
  }
}

module.exports = Layout;