const fs = require('fs');
const zipFolder = require('folder-zip-sync');
 
const { renderTemplate } = require('./templateRenderer/renderTemplate.js');

const datasetSiteIdentifier = 'datasetsite';

const buildOutputsConfig = [
  {
    datasetSiteIdentifier: 'datasetsite',
    embed: false,
    outputFilename: 'datasetsite-csp'
  },
  {
    datasetSiteIdentifier: 'datasetsite',
    embed: true,
    outputFilename: 'datasetsite'
  },
];

// Create output directory if it does not already exist
fs.mkdirSync('./dist/' , { recursive: true });

buildOutputsConfig.forEach(config => {
  const templateContents = renderTemplate(config.datasetSiteIdentifier, config.embed);
  const outputTemplateFile = `./dist/${config.outputFilename}.mustache`;
  fs.writeFileSync(outputTemplateFile, templateContents, { encoding:'utf8' });
  console.log(`Writing: ${outputTemplateFile}`);
  if (!config.embed) {
    // Output required static files if they are not embedded
    // TODO: This should only zip the relevant stylesheet if more than one is present in ./static/
    const outputZipFile = `./dist/${config.outputFilename}.static.zip`;
    zipFolder('./src/static', `./dist/${config.outputFilename}.static.zip`);
    console.log(`Writing: ${outputZipFile}`);
  }
});

console.log('\nBuild completed successfully');
