const Mustache = require('mustache');
const fs = require('fs');
const path = require('path');

function getDatasetSiteTemplateFilename(singleFileMode) {
  return  `datasetsite${singleFileMode ? '' : '-csp'}.mustache`;
}

function getDatasetSiteTemplateFullPath(singleFileMode) {
  return path.join(__dirname, '..', 'dist', getDatasetSiteTemplateFilename(singleFileMode));
}

async function getDatasetSiteTemplate(singleFileMode) {
  // Get pre-rendered template from ./dist/
  return await fs.readFile(getDatasetSiteTemplateFullPath(singleFileMode), { encoding:'utf8' });
}

function getDatasetSiteTemplateSync(singleFileMode) {
  // Get pre-rendered template from ./dist/
  return fs.readFileSync(getDatasetSiteTemplateFullPath(singleFileMode), { encoding:'utf8' });
}

async function renderDatasetSite(jsonld, stylesheetUrl) {
  // Prepare data for mustache template
  const data = renderDatasetSiteData(jsonld, stylesheetUrl);

  // Get relevant template
  const template = await getDatasetSiteTemplate(!!data.stylesheetUrl);
    
  // Use the resulting JSON with the mustache template to render the dataset site.
  const html = Mustache.render(template, data);
  return html;
}

function renderDatasetSiteSync(jsonld, stylesheetUrl) {
  // Prepare data for mustache template
  const data = renderDatasetSiteData(jsonld, stylesheetUrl);

  // Get relevant template
  const template = getDatasetSiteTemplateSync(!data.stylesheetUrl);
    
  // Use the resulting JSON with the mustache template to render the dataset site.
  const html = Mustache.render(template, data);
  return html;
}

function renderDatasetSiteData(jsonld, stylesheetUrl) {
  // The entire jsonld data object needs to be included in the dataset site so the OpenActive parser can read it
  // Create a `jsonld` property containing stringified `jsonld` so that Mustache can read it
  const data = {
    ...jsonld,
    jsonld: JSON.stringify(jsonld, null, 2)
  };

  if (stylesheetUrl) {
    // Create a `stylesheet` property containing the path to the stylesheet so that Mustache can read it
    data.stylesheetUrl = stylesheetUrl;
  }
  return data
}

function copyTemplateSync(destinationRelativePath, singleFileMode) {
  const sourcePath = getDatasetSiteTemplateFullPath(singleFileMode);
  const destinationPath = path.join(process.cwd(), destinationRelativePath, getDatasetSiteTemplateFilename(singleFileMode));
  fs.copyFileSync(sourcePath, destinationPath);
}

function writeTemplatesToDirectorySync(destinationRelativePath) {
  // Create output directory if it does not already exist
  fs.mkdirSync(path.join(process.cwd(), destinationRelativePath) , { recursive: true });
  copyTemplateSync(destinationRelativePath, true);
  copyTemplateSync(destinationRelativePath, false);
}

module.exports = {
  getDatasetSiteTemplate,
  getDatasetSiteTemplateSync,
  renderDatasetSite,
  renderDatasetSiteSync,
  writeTemplatesToDirectorySync,
};

