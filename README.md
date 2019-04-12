cytoscape-fcose
================================================================================


## Description

fCoSE (fast Compound Spring Embedder) is a faster version of our earlier compound spring embedder algorithm named [CoSE](https://github.com/cytoscape/cytoscape.js-cose-bilkent), implemented as a Cytoscape.js extension by [i-Vis Lab](http://cs.bilkent.edu.tr/~ivis/) in Bilkent University ([demo](https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo.html), [compound demo](https://ivis-at-bilkent.github.io/cytoscape.js-fcose/demo-compound.html))

fCoSE layout algorithm combines the speed of spectral layout with the aesthetics of force-directed layout. fCoSE runs up to 10 times as fast as CoSE while achieving similar aesthetics. In addition, fCoSE supports varying (non-uniform) node dimensions similar to its predecessor CoSE.

Please cite the following when you use this layout until an fCoSE publication is available:

U. Dogrusoz, E. Giral, A. Cetintas, A. Civril, and E. Demir, "[A Layout Algorithm For Undirected Compound Graphs](http://www.sciencedirect.com/science/article/pii/S0020025508004799)", Information Sciences, 179, pp. 980-994, 2009.

## Dependencies

 * Cytoscape.js ^3.2.0
 * numeric.js ^1.2.6
 * cose-base ^1.0.0


## Usage instructions

Download the library:
 * via npm: `npm install cytoscape-fcose`,
 * via bower: `bower install cytoscape-fcose`, or
 * via direct download in the repository (probably from a tag).

Import the library as appropriate for your project:

ES import:

```js
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

cytoscape.use( fcose );
```

CommonJS require:

```js
let cytoscape = require('cytoscape');
let fcose = require('cytoscape-fcose');

cytoscape.use( fcose ); // register extension
```

AMD:

```js
require(['cytoscape', 'cytoscape-fcose'], function( cytoscape, fcose ){
  fcose( cytoscape ); // register extension
});
```

Plain HTML/JS has the extension registered for you automatically, because no `require()` is needed.


## API

When calling the layout, e.g. `cy.layout({ name: 'fcose', ... })`, the following options are supported:

```js
var defaultOptions = {

  // 'draft', 'default' or 'proof' 
  // - "draft" only applies spectral layout 
  // - "default" improves the quality with incremental layout (fast cooling rate)
  // - "proof" improves the quality with incremental layout (slow cooling rate) 
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
  
  /* spectral layout options */
  
  // false for random, true for greedy sampling
  samplingType: true,
  // sample size to construct distance matrix
  sampleSize: 25,
  // separation amount between nodes
  nodeSeparation: 75,
  // power iteration tolerance
  piTol: 0.0000001,
  
  /* incremental layout options */
  
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
  tile: false,  
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
};
```


## Build targets

* `npm run test` : Run Mocha tests in `./test`
* `npm run build` : Build `./src/**` into `cytoscape-fcose.js`
* `npm run watch` : Automatically build on changes with live reloading (N.b. you must already have an HTTP server running)
* `npm run dev` : Automatically build on changes with live reloading with webpack dev server
* `npm run lint` : Run eslint on the source

N.b. all builds use babel, so modern ES features can be used in the `src`.


## Publishing instructions

This project is set up to automatically be published to npm and bower.  To publish:

1. Build the extension : `npm run build:release`
1. Commit the build : `git commit -am "Build for release"`
1. Bump the version number and tag: `npm version major|minor|patch`
1. Push to origin: `git push && git push --tags`
1. Publish to npm: `npm publish .`
1. If publishing to bower for the first time, you'll need to run `bower register cytoscape-fcose https://github.com/iVis-at-Bilkent/cytoscape.js-fcose.git`
1. [Make a new release](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose/releases/new) for Zenodo.

## Team

  * [Hasan Balcı](https://github.com/hasanbalci) and [Ugur Dogrusoz](https://github.com/ugurdogrusoz) of [i-Vis at Bilkent University](http://www.cs.bilkent.edu.tr/~ivis)
