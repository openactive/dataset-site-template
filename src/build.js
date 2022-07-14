const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
 
const { renderTemplate, getStylesDestinationFileName, getStylesSourceFileName } = require('./templateRenderer/renderTemplate.js');

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

const addFilesFromDirectoryToZip = (directoryPath, zip, fileRenameMap) => {
  const directoryContents = fs.readdirSync(path.join(__dirname, directoryPath), {
    withFileTypes: true,
  });
 
  directoryContents.forEach(({ name }) => {
    const filepath = path.join(__dirname, directoryPath, name);

    if (fs.statSync(filepath).isFile()) {
      const mappedFilename = fileRenameMap[name] || name;
      zip.file(mappedFilename, fs.readFileSync(filepath));
    }
  });
};

const getZipFilenameMapping = () => {
  const fileNameMapping = {};
  fileNameMapping[getStylesSourceFileName()] = getStylesDestinationFileName();
  return fileNameMapping;
}

// Create output directory if it does not already exist
fs.mkdirSync('./dist/' , { recursive: true });

buildOutputsConfig.forEach(config => {
  const templateContents = renderTemplate(config.datasetSiteIdentifier, config.embed);
  const outputTemplateFile = `./dist/${config.outputFilename}.mustache`;
  fs.writeFileSync(outputTemplateFile, templateContents, { encoding:'utf8' });
  console.log(`Writing: ${outputTemplateFile}`);
  if (!config.embed) {
    const zip = new JSZip();
    addFilesFromDirectoryToZip('./static', zip, getZipFilenameMapping());
    
    // Output required static files if they are not embedded
    // TODO: This should only zip the relevant stylesheet if more than one is present in ./static/
    const outputZipFile = `./dist/${config.outputFilename}.static.zip`;
    zip
      .generateNodeStream({
        type: 'nodebuffer',
        streamFiles: true,
        compression: "DEFLATE",
        compressionOptions: {
          level: 9
        }
      })
      .pipe(fs.createWriteStream(outputZipFile))
      .on('finish', function () {
          // JSZip generates a readable stream with a "end" event,
          // but is piped here in a writable stream which emits a "finish" event.
          console.log(`Writing: ${outputZipFile}`);

          console.log('\nBuild completed successfully');
      });
  }
});
