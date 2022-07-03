const Mustache = require('mustache');
const fs = require('fs');
const path = require('path');
var pjson = require('../package.json');

const CSP_STYLESHEET_FILENAME = 'datasetsite-csp.static.zip';

function getDatasetSiteTemplateFilename(singleFileMode) {
  return  `datasetsite${singleFileMode ? '' : '-csp'}.mustache`;
}

function getDistFullPath(filename) {
  return path.join(__dirname, '..', 'dist', filename);
}

async function getDatasetSiteTemplate(singleFileMode) {
  // Get pre-rendered template from ./dist/
  return await fs.readFile(getDistFullPath(getDatasetSiteTemplateFilename(singleFileMode)), { encoding:'utf8' });
}

function getDatasetSiteTemplateSync(singleFileMode) {
  // Get pre-rendered template from ./dist/
  return fs.readFileSync(getDistFullPath(getDatasetSiteTemplateFilename(singleFileMode)), { encoding:'utf8' });
}

async function renderDatasetSite(jsonld, staticAssetsPathUrl) {
  // Prepare data for mustache template
  const data = renderDatasetSiteData(jsonld, staticAssetsPathUrl);

  // Get relevant template
  const template = await getDatasetSiteTemplate(!!data.staticAssetsPathUrl);
    
  // Use the resulting JSON with the mustache template to render the dataset site.
  const html = Mustache.render(template, data);
  return html;
}

function renderDatasetSiteSync(jsonld, staticAssetsPathUrl) {
  // Prepare data for mustache template
  const data = renderDatasetSiteData(jsonld, staticAssetsPathUrl);

  // Get relevant template
  const template = getDatasetSiteTemplateSync(!data.staticAssetsPathUrl);
    
  // Use the resulting JSON with the mustache template to render the dataset site.
  const html = Mustache.render(template, data);
  return html;
}

function renderDatasetSiteData(jsonld, staticAssetsPathUrl) {
  // The entire jsonld data object needs to be included in the dataset site so the OpenActive parser can read it
  // Create a `jsonld` property containing stringified `jsonld` so that Mustache can read it
  const data = {
    ...jsonld,
    jsonld: JSON.stringify(jsonld, null, 2)
  };

  if (staticAssetsPathUrl) {
    // Create a `stylesheet` property containing the path to the stylesheet so that Mustache can read it
    data.staticAssetsPathUrl = staticAssetsPathUrl;
  }
  return data
}

function copyFileFromDistToDirectory(destinationRelativePath, filename) {
  const sourcePath = getDistFullPath(filename);
  const destinationPath = path.join(process.cwd(), destinationRelativePath, filename);
  fs.copyFileSync(sourcePath, destinationPath);
}

function copyTemplateSync(destinationRelativePath, singleFileMode) {
  copyFileFromDistToDirectory(destinationRelativePath, getDatasetSiteTemplateFilename(singleFileMode));
}

function writeTemplatesToDirectorySync(destinationRelativePath) {
  // Create output directory if it does not already exist
  fs.mkdirSync(path.join(process.cwd(), destinationRelativePath) , { recursive: true });
  copyTemplateSync(destinationRelativePath, true);
  copyTemplateSync(destinationRelativePath, false);
}

function writeAssetsArchiveToDirectorySync(destinationRelativePath) {
  // Create output directory if it does not already exist
  fs.mkdirSync(path.join(process.cwd(), destinationRelativePath) , { recursive: true });
  
  copyFileFromDistToDirectory(destinationRelativePath, CSP_STYLESHEET_FILENAME);
}

function getStaticAssetsArchiveUrl() {
  return `https://unpkg.com/@openactive/dataset-site-template@${pjson.version}/dist/datasetsite-csp.static.zip`  
}

module.exports = {
  getDatasetSiteTemplate,
  getDatasetSiteTemplateSync,
  renderDatasetSite,
  renderDatasetSiteSync,
  writeTemplatesToDirectorySync,
  writeAssetsArchiveToDirectorySync,
  getStaticAssetsArchiveUrl
};
