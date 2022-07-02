#!/usr/bin/env node

const fs = require('fs');
const { renderDatasetSiteSync } = require('../lib');

function main() {
  var args = process.argv.slice(2);

  if (args.length < 2 || args.length > 3) {
    console.log(`
  Usage:
    npx @openactive/dataset-site <inputJsonFile> <outputHtmlFile> [stylesheetUrl]

  Arguments:
    inputJsonFile: Dataset Site JSON file used to generate the Dataset Site HTML
    outputHtmlFile: Output Dataset Site HTML file
    stylesheetUrl: Optional. Path to the datasetsite.styles.css file, if you are hosting static files. 
      If stylesheetUrl is not supplied, the single-file template is used.

  Example:
    npx @openactive/dataset-site example.jsonld output.html "http://localhost:4000/static/datasetsite.styles.css"

  `);
    process.exit(0);
  }

  [ inputJsonFilePath, outputHtmlFilePath, stylesheetUrl ] = args;

  const jsonld = JSON.parse(fs.readFileSync(inputJsonFilePath, { encoding:'utf8' }));
  const html = renderDatasetSiteSync(jsonld, stylesheetUrl);

  fs.writeFileSync(outputHtmlFilePath, html, { encoding:'utf8' });

  console.log('File written successfully');
}

if (require.main === module) {
  main();
}