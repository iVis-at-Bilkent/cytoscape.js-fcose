const cytoscape = require('cytoscape');
const path = require('path');
const fs = require('fs');
const {performance} = require('perf_hooks');
const fcose = require('cytoscape-fcose');
const coseBilkent = require('cytoscape-cose-bilkent');

cytoscape.use( fcose );
cytoscape.use( coseBilkent );

let moveFrom = "./graphs";
let moveTo = "./results";
let toPath = path.join(moveTo, "fcose_cose.csv");
let results = "";

fs.readdir(moveFrom, function (err, files) {
  if (err) {
    console.error("Could not list the directory.", err);
    process.exit(1);
  }

  files.forEach(function (file, index) {    
    let fromPath = path.join(moveFrom, file);    
    //let toPath = path.join(moveTo, file.split('.')[0] + "_compound" + ".json");    
    fs.readFile(fromPath, 'utf8', function (err, fileContent) {
      if (err) {
        return console.log(err);
      }
      
      let cy = cytoscape({
        headless: true,
        styleEnabled: true
      });
      results += file + ',';

      cy.json({elements: JSON.parse(fileContent)});
      for(let i = 0; i < 5; i++) {
        let start = performance.now();
        cy.layout({name: 'fcose', quality: 'default', step: 'all', packComponents: false, animate: false, fit: false}).run();
        let end = performance.now();
        results += Math.round((end - start) * 10 ) / 10 + ',';
      }

      results += ',';

      for(let i = 0; i < 5; i++) {
        let start = performance.now();
        cy.layout({name: 'cose-bilkent', packComponents: false, animate: false, fit: false}).run();
        let end = performance.now();
        results += Math.round((end - start) * 10 ) / 10 + ',';
      }  

      results += ',';
      results += '\n';

      console.log(file + " finished!");

      if(index == files.length - 1) {
        fs.writeFile(toPath, results, function (err) {
          if (err) return console.log(err);
        });
      }
    });    
  });
});

function isCLRF(source) {
  let temp = source.indexOf('\n');
  if (source[temp - 1] === '\r')
    return true;
  return false;
}
