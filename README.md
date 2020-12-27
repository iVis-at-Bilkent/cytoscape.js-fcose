## fCoSE Paper - Test Assets

* ***test-graphs*** folder consists of randomly generated compound graphs with 10 to 5000 nodes grouped in two subfolders. 
We consider graphs with 10 to 200 nodes as *small-sized* graphs and graphs with 250 to 5000 nodes as *medium-sized* graphs. 
These graphs are generated from the biconnected, undirected, and 4-planar [Rome graphs](http://www.dia.uniroma3.it/~gdt/gdt4/test_suite.php) 
by applying [Markov Clustering Algorithm](https://micans.org/mcl/) implemented as [part](https://js.cytoscape.org#eles.markovClustering) 
of the [Cytoscape.js](https://js.cytoscape.org) graph visualization library. More details about the generation of the graphs can be found in the supplementary material of the fCoSE paper.

* ***test-scripts*** folder consists of five test scripts and some auxiliary folders/files. Four of the test scripts are for the performance 
comparison between fCoSE and CoLa algorithms on various constraint types. The other test script is to measure the run time performances of fCoSE and CoSE algorihms.
Test scripts run on [Node.js](https://nodejs.org/en/) environment and uses headless mode of the [Cytoscape.js](https://js.cytoscape.org) library. 
Follow these steps to be able run the test scripts: 

    * Install [Node.js](https://nodejs.org/en/) Javascript runtime environment.
    * Download *test-scripts* folder and ```cd``` into it.
    * Run ```npm install``` command to install dependencies.
    * Replace *cytoscape-layvo.js* file in node_modules\cytoscape-layvo\ with the provided one.  
			This is because Cytoscape.js does not allow to get edge source and target end points in headless mode, so we use node positions instead.
    * Create *graphs* and *results* folders and put the test graphs inside the *graphs* folder.
    * Run the script with two arguments, first one is the number of test graphs and the second one is the ratio of the constrained nodes.
			For example, to run the fixed node constraint script on 100 test graphs where the constrained node ratio is 25,  
			```node fcose_vs_cola_fixed_node_performance_test.js 100 25```  
			For the fCoSE vs CoSE script, there is no need to any arguments.
    * Test results will be available in *results* folder in five evaluation metrics for fCoSE vs CoLa comparison (*run time, avg. edge length, # of edge crossings, 
			# of node overlaps and total area*) and in one evaluation metric (*run time*) for fCoSE vs CoSE comparison.
