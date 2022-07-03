#!/usr/bin/env node

const fs = require('fs');
const { renderDatasetSiteSync, writeTemplatesToDirectorySync, writeAssetsArchiveToDirectorySync, unzipAssetsArchiveToDirectory } = require('../lib');

function main() {
  var args = process.argv.slice(2);

  if (args.length < 2 || args.length > 4) {
    console.log(`
Usage:
  npx @openactive/dataset-site-template@<version> <inputJsonFile> <outputHtmlFile> [staticAssetsPathUrl] [staticAssetsOutputDirectory]

  Arguments:
    inputJsonFile: Dataset Site JSON file used to generate the Dataset Site HTML
    outputHtmlFile: Output Dataset Site HTML file, rendered using the relevant template
    staticAssetsPathUrl: Optional.
      Relative or absolute URL path to the hosted CSP assets (contents of datasetsite-csp.static.zip), if you are hosting static files.
      If staticAssetsPathUrl is supplied, the CSP compatible template is used, otherwise the single-file template is used.
      staticAssetsPathUrl is relative to the hosted location of the outputHtmlFile.
    staticAssetsOutputDirectory: Optional. If supplied, output the CSP assets (contents of datasetsite-csp.static.zip) to this directory.

  npx @openactive/dataset-site-template@<version> --raw <outputDirectory>

  Arguments:
    outputDirectory: Output both raw mustache template files and the CSP assets archive to this directory

Examples:
  npx @openactive/dataset-site-template@latest example.jsonld index.html
  npx @openactive/dataset-site-template@latest example.jsonld index.html . .
  npx @openactive/dataset-site-template@latest example.jsonld output.html "http://example.com/static" ./static
  npx @openactive/dataset-site-template@latest --raw ./templates

  `);
    process.exit(0);
  }

  [ inputJsonFilePath, outputPath, staticAssetsPathUrl, staticAssetsOutputDirectory ] = args;

  if (inputJsonFilePath === '--raw') {
    writeTemplatesToDirectorySync(outputPath);
    writeAssetsArchiveToDirectorySync(outputPath);
    console.log('Templates and assets written successfully');
    return;
  }

  const jsonld = JSON.parse(fs.readFileSync(inputJsonFilePath, { encoding:'utf8' }));
  const html = renderDatasetSiteSync(jsonld, staticAssetsPathUrl);

  fs.writeFileSync(outputPath, html, { encoding:'utf8' });

  if (staticAssetsOutputDirectory) unzipAssetsArchiveToDirectory(staticAssetsOutputDirectory).then(files => {
      console.log('CSP archive extracted successfully');
  });

  console.log('Files written successfully');
}

if (require.main === module) {
  main();
}