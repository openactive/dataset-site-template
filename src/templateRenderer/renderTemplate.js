const fs = require('fs');
const path = require('path');

const MIMETYPES = {
  'woff': 'application/font-woff',
  'png': 'image/png' 
}

const npmPackageMajorVersion = process.env.npm_package_version.substring(0, process.env.npm_package_version.indexOf("."));

function encodeDataUri(buffer, extension) {
  const mimetype = MIMETYPES[extension];
  return `url(data:${mimetype};base64,${buffer.toString('base64')})`;
}

function replaceReferencesWithEmbedsAndRemoveFonts(css) {
  // Remove Google fonts
  const cssWithoutFonts = css.replace(/\/\* PRE-PROCESSOR INSTRUCTION: START GOOGLE FONTS \*\/[\s\S]*?\/\* PRE-PROCESSOR INSTRUCTION: END GOOGLE FONTS \*\//mg, (match, $1, $2) => '');

  // Replaces references with embeds
  return cssWithoutFonts.replace(/url\((.*?)\.(.*?)\)/g, (match, $1, $2) => {
    // Do not embed Font Awesome; use references instead
    if ($1 == 'fontawesome-webfont') {
      return `url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/fontawesome-webfont.woff)`
    }

    const buffer = fs.readFileSync(`./src/static/${$1}.${$2}`);
    return encodeDataUri(buffer, $2);
  });
}

function replacePlaceholdersWithContent(input, versionContent, stylesContent, warningContent) {
  return input.replace(/<!-- (VERSION|STYLES|STYLES WARNING) PLACEHOLDER -->/g, (match, $1) => {
    if ($1 === 'VERSION') return versionContent;
    if ($1 === 'STYLES') return stylesContent;
    if ($1 === 'STYLES WARNING') return warningContent;
    return content;
  });
}

function getStylesDestinationFileName() {
  return `datasetsite.styles.v${npmPackageMajorVersion}.css`;
}

function getStylesSourceFileName() {
  return `datasetsite.styles.css`;
}

function getDatasetSiteTemplateFilename(singleFileMode) {
  return  `datasetsite${singleFileMode ? '' : '-csp'}.mustache`;
}

function renderTemplate(datasetSiteIdentifier, singleFileMode, stylesDestinationFileNameOverride) {
  // Get template of the template
  let templateOfTemplate;
  try {
    templateOfTemplate = fs.readFileSync(path.join(__dirname, `../templates/${datasetSiteIdentifier}.mustache.template`), { encoding:'utf8' });
  } catch {
    console.log(`Not found: 'templates/${datasetSiteIdentifier}.mustache.template'`)
    console.log(`Falling back to: 'templates/archive/${datasetSiteIdentifier}.mustache'`)
    templateOfTemplate = fs.readFileSync(path.join(__dirname,`../templates/archive/${datasetSiteIdentifier}.mustache`), { encoding:'utf8' });
  }

  const stylesFile = stylesDestinationFileNameOverride || getStylesDestinationFileName();

  // Render version comment
  const versionHtml = `<!--
  OpenActive Dataset Site Template version ${npmPackageMajorVersion}, from https://unpkg.com/@openactive/dataset-site-template@${process.env.npm_package_version}/dist/${getDatasetSiteTemplateFilename(singleFileMode)}${!singleFileMode ? `
  
  This HTML file must reference a self-hosted '${stylesFile}' file, co-located with the rest
  of the static assets from the following archive:
  https://unpkg.com/@openactive/dataset-site-template@${npmPackageMajorVersion}.0.0/dist/datasetsite-csp.static.zip` : ''}
-->`;

  // Render styles depending on whether or not embedding is enabled
  const stylesHtml = singleFileMode ?
    `
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,600" crossorigin="anonymous">
    <style>${replaceReferencesWithEmbedsAndRemoveFonts(fs.readFileSync(`./src/static/${datasetSiteIdentifier}.styles.css`, { encoding:'utf8' }))}</style>` :
    `
    <!--
      This stylesheet href must reference a self-hosted '${stylesFile}' file in
      the same directory as the other static assets sourced from the following archive:
      https://unpkg.com/@openactive/dataset-site-template@${npmPackageMajorVersion}.0.0/dist/datasetsite-csp.static.zip
    -->
    <link rel="stylesheet" href="{{{staticAssetsPathUrl}}}/${stylesFile}" crossorigin="anonymous">\n`;

  // Render warning for developers who have not hosted the static assets correctly
  const stylesWarningHtml = singleFileMode ? '' : `
    <table class="always-hidden" bgcolor="#FFFFFF" width="100%" height="500px"><tr><td align="center">
      <p></p>
      <p><large><strong>Error: Static Assets Not Found</strong><large></p>
      <p>This HTML page must reference self-hosted static assets located at the relative or absolute path configured by "staticAssetsPathUrl" in the mustache template source data.</p>
      <p>"staticAssetsPathUrl" is currently set to "{{staticAssetsPathUrl}}", and this page has failed to access this file: <pre>{{staticAssetsPathUrl}}/${stylesFile}</pre></p>
      <p>Please ensure that the assets at this location exactly match those in
      <a href="https://unpkg.com/@openactive/dataset-site-template@${npmPackageMajorVersion}.0.0/dist/datasetsite-csp.static.zip">datasetsite-csp.static.zip version ${npmPackageMajorVersion}</a>.</p>
      <p></p>
      <p>See the <a href="https://github.com/openactive/dataset-site-template">"CSP compatible template" documentation</a> for more information</p>
      <p></p>
    </td></tr></table>
  `;
  
  return replacePlaceholdersWithContent(templateOfTemplate, versionHtml, stylesHtml, stylesWarningHtml);
}

module.exports = {
  renderTemplate,
  getStylesDestinationFileName,
  getStylesSourceFileName,
  getDatasetSiteTemplateFilename
};
