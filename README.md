## fCoSE Paper - Test Assets

* ***test-graphs*** folder consists of randomly generated compound graphs with 10 to 5000 nodes grouped in two subfolders. 
We consider graphs with 10 to 200 nodes as *small-sized* graphs and graphs with 250 to 5000 nodes as *medium-sized* graphs. 
These graphs are generated from the biconnected, undirected, and 4-planar [Rome graphs](http://www.dia.uniroma3.it/~gdt/gdt4/test_suite.php) 
and from a selection of denser graphs in the [Network Repository](http://networkrepository.com) by applying [Markov Clustering Algorithm](https://micans.org/mcl/) implemented as [part](https://js.cytoscape.org#eles.markovClustering) 
of the [Cytoscape.js](https://js.cytoscape.org) graph visualization library. More details about the generation of the graphs can be found in the supplementary material of the fCoSE paper.

* ***test-scripts*** folder consists of five subfolders. Four of them include test scripts for the performance 
comparison between fCoSE and CoLa algorithms on various constraint types. The other folder includes the test script to measure the run time performances of fCoSE and CoSE algorihms.
Test scripts run on web browser and uses the [Cytoscape.js](https://js.cytoscape.org) library. 
Follow these steps to run the test scripts: 

    * Download *test-scripts* folder and ```cd``` into it.
    * If you select one of the constraint-named folders:
    	*  You will see two subfolders: *small_sized_graphs* folder includes test script to measure the performance of fCoSE and CoLa on small-sized graphs. *medium_sized_graphs* folder includes test script to measure the performance of fCoSE on medium-sized graphs. Select the folder you want to run test.
    	*  Open the html file in a web browser. Select the constraint ratio and the graph dataset (Rome/Network Repository) you want to run test, and click on the *Start Test* button.
    	*  When test finishes, test results will be downloaded in six evaluation metrics (*run time, avg. edge length, # of edge crossings, # of node-edge overlaps, # of node-node overlaps and total area*).
    * If you select the folder named *fcose_cose*:
    	*  Open the html file in a web browser. Click on the *Start Test* button.
    	*  When test finishes, test result will be downloaded in one evaluation metric (*run time*) for fCoSE vs CoSE comparison.
