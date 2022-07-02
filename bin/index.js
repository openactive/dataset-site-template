#!/usr/bin/env node

const fs = require('fs');
const { renderDatasetSiteSync, writeTemplatesToDirectorySync } = require('../lib');

function main() {
  var args = process.argv.slice(2);

  if (args.length < 2 || args.length > 3) {
    console.log(`
  Usage:
    npx @openactive/dataset-site-template <inputJsonFile> <outputHtmlFile> [stylesheetUrl]
 
    Arguments:
      inputJsonFile: Dataset Site JSON file used to generate the Dataset Site HTML
      outputHtmlFile: Output Dataset Site HTML file, rendered using the relevant template
      stylesheetUrl: Optional. Path to the datasetsite.styles.css file, if you are hosting static files. 
        If stylesheetUrl is supplied, CSP compatible template is used, otherwise the single-file template is used.

    npx @openactive/dataset-site-template --raw <outputDirectory>

    Arguments:
      outputDirectory: Output both template files to this directory in raw mustache format

  Example:
    npx @openactive/dataset-site-template example.jsonld output.html "http://localhost:4000/static/datasetsite.styles.css"
    npx @openactive/dataset-site-template --raw ./templates

  `);
    process.exit(0);
  }

  [ inputJsonFilePath, outputPath, stylesheetUrl ] = args;

  if (inputJsonFilePath === '--raw') {
    writeTemplatesToDirectorySync(outputPath);
    console.log('Templates written successfully');
    return;
  }

  const jsonld = JSON.parse(fs.readFileSync(inputJsonFilePath, { encoding:'utf8' }));
  const html = renderDatasetSiteSync(jsonld, stylesheetUrl);

  fs.writeFileSync(outputPath, html, { encoding:'utf8' });

  console.log('File written successfully');
}

if (require.main === module) {
  main();
}