const Mustache = require('mustache');
const fsSync = require('fs');
const fs = require('fs').promises;
const path = require('path');
const pjson = require('../package.json');
const extract = require('extract-zip')
 
const CSP_ASSET_ARCHIVE_FILENAME = 'datasetsite-csp.static.zip';

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
  return fsSync.readFileSync(getDistFullPath(getDatasetSiteTemplateFilename(singleFileMode)), { encoding:'utf8' });
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

function stripTrailingSlash (str) {
  return str.endsWith('/') ?
      str.slice(0, -1) :
      str;
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
    data.staticAssetsPathUrl = stripTrailingSlash(staticAssetsPathUrl);
  }
  return data
}

function copyFileFromDistToDirectorySync(destinationRelativeDirectoryPath, filename) {
  const sourcePath = getDistFullPath(filename);
  const destinationPath = path.join(process.cwd(), destinationRelativeDirectoryPath, filename);
  fsSync.copyFileSync(sourcePath, destinationPath);
}

async function unzipFileFromDistToDirectory(filename, destinationRelativeDirectoryPath) {
  const sourcePath = getDistFullPath(filename);
  const destinationDirectoryPath = path.join(process.cwd(), destinationRelativeDirectoryPath);
  // Unzip
  await extract(sourcePath, { dir: destinationDirectoryPath });
}

function copyTemplateSync(destinationRelativePath, singleFileMode) {
  copyFileFromDistToDirectorySync(destinationRelativePath, getDatasetSiteTemplateFilename(singleFileMode));
}

function writeTemplatesToDirectorySync(destinationRelativeDirectoryPath) {
  // Create output directory if it does not already exist
  fsSync.mkdirSync(path.join(process.cwd(), destinationRelativeDirectoryPath) , { recursive: true });
  copyTemplateSync(destinationRelativeDirectoryPath, true);
  copyTemplateSync(destinationRelativeDirectoryPath, false);
}

function writeAssetsArchiveToDirectorySync(destinationRelativeDirectoryPath) {
  // Create output directory if it does not already exist
  fsSync.mkdirSync(path.join(process.cwd(), destinationRelativeDirectoryPath) , { recursive: true });
  
  copyFileFromDistToDirectorySync(destinationRelativeDirectoryPath, CSP_ASSET_ARCHIVE_FILENAME);
}

async function unzipAssetsArchiveToDirectory(destinationRelativeDirectoryPath) {
  // Create output directory if it does not already exist
  fsSync.mkdirSync(path.join(process.cwd(), destinationRelativeDirectoryPath) , { recursive: true });
  
  await unzipFileFromDistToDirectory(CSP_ASSET_ARCHIVE_FILENAME, destinationRelativeDirectoryPath);
}

function getStaticAssetsArchiveUrl() {
  return `https://unpkg.com/@openactive/dataset-site-template@${getStaticAssetsVersion()}.0.0/dist/${CSP_ASSET_ARCHIVE_FILENAME}`  
}

function getStaticAssetsVersion() {
  return pjson.version.substring(0, pjson.version.indexOf("."));
}

module.exports = {
  getDatasetSiteTemplate,
  getDatasetSiteTemplateSync,
  renderDatasetSite,
  renderDatasetSiteSync,
  writeTemplatesToDirectorySync,
  writeAssetsArchiveToDirectorySync,
  unzipAssetsArchiveToDirectory,
  getStaticAssetsArchiveUrl,
  getStaticAssetsVersion,
};
