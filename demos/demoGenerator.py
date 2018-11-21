import sys
from random import random

nodes = int(sys.argv[1])
prob = float(sys.argv[2])

f = open("demo" + str(nodes) + "-" + str(prob) + ".html", 'w')

f.write("""
<!DOCTYPE>

<html>

  <head>
    <title>cytoscape-fcose.js demo</title>

      <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1">

      <script src="https://unpkg.com/cytoscape/dist/cytoscape.min.js"></script>

      <!-- for testing with local version of cytoscape.js -->
      <!--<script src="../cytoscape.js/build/cytoscape.js"></script>-->

      <script src="cytoscape-fcose.js"></script>

      <style>
        body {
          font-family: helvetica neue, helvetica, liberation sans, arial, sans-serif;
          font-size: 14px;
        }

        #cy {
          position: absolute;
          width: 100%;
          height: 90%;
          z-index: 999;
        }

        h1 {
          opacity: 0.5;
          font-size: 1em;
          font-weight: bold;
        }
      </style>

      <script>
        document.addEventListener('DOMContentLoaded', function(){

          var cy = window.cy = cytoscape({
            container: document.getElementById('cy'),

            // demo your layout
            layout: {
              name: 'fcose',

              // some more options here...
            },

            style: [
              {
                selector: 'node',
                style: {
                  'content': 'data(id)',
                }
              },

              {
                selector: 'edge',
                style: {
                  //'width': 0.1
                }
              }
            ],

            elements: {
              nodes: [
""")

for i in range(0,nodes-1):
    f.write("                { data: { id: \'n"+str(i)+"\'} },\n")

f.write("                { data: { id: \'n"+str(nodes-1)+"\'} }\n"+
        "              ],\n" +
        "              edges: [\n")

adjMatrix = [[0 for x in range(nodes)] for y in range(nodes)]

i_last = 0
j_last = 0

for i in range(0,nodes):
    for j in range(0,nodes):
        if random() <= prob:
            adjMatrix[i][j] = 1
            i_last = i
            j_last = j

for i in range(0,nodes):
    for j in range(0,nodes):
        if adjMatrix[i][j] == 1 and (i_last != i or j_last != j):
            f.write("                { data: { source: \'n"+str(i)+"\', target: \'n"+str(j)+"\' } },\n")

f.write("                { data: { source: \'n"+str(i_last)+"\', target: \'n"+str(j_last)+"\' } }\n")
f.write("""
              ]
            }
          });

          document.getElementById("layoutButton").addEventListener("click", function(){
            var layout = cy.layout({
              name: 'fcose'
            });
            
            layout.run();
          });
          
          document.getElementById("randomize").addEventListener("click", function(){
            var layout = cy.layout({
              name: 'random',
              fit: true,
              animate: true,
              animationDuration: 1000
            });
            
            layout.run();
          });


        });
      </script>
  </head>

  <body>
          <h1>cytoscape-fcose demo</h1>

          <button id="randomize" type="button">Randomize</button>
          <button id="layoutButton" type="button">fcose</button>             

          <div id="cy"></div>

  </body>

</html>
""")
