const fs = require('fs');
const path = require('path');

const MIMETYPES = {
  'woff': 'application/font-woff',
  'png': 'image/png' 
}

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

function replaceStylesPlaceholderWithContent(input, content) {
  return input.replace(/<!-- STYLES PLACEHOLDER -->/, (match, $1) => {
    return content;
  });
}

function appendAfterDoctype(input, content) {
  return input.replace(/<!DOCTYPE HTML>/, (match, $1) => {
    return `<!DOCTYPE HTML>\n\n${content}\n`;
  });
}

function getStylesDestinationFileName() {
  return `datasetsite.styles.v${process.env.npm_package_version}.css`;
}

function getStylesSourceFileName() {
  return `datasetsite.styles.css`;
}

function renderTemplate(datasetSiteIdentifier, embed, stylesDestinationFileNameOverride) {
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

  // Render styles depending on whether or not embedding is enabled
  const stylesHtml = embed ?
    `
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,600" crossorigin="anonymous">
    <style>${replaceReferencesWithEmbedsAndRemoveFonts(fs.readFileSync(`./src/static/${datasetSiteIdentifier}.styles.css`, { encoding:'utf8' }))}</style>` :
    `
    <!--
      This stylesheet href must reference a self-hosted '${stylesFile}' file in
      the same directory as the other static assets sourced from the following archive:
      https://unpkg.com/@openactive/dataset-site-template@${process.env.npm_package_version}/dist/datasetsite-csp.static.zip
    -->
    <link rel="stylesheet" href="{{{staticAssetsPathUrl}}}/${stylesFile}" crossorigin="anonymous">\n`;

  templateOfTemplate = appendAfterDoctype(templateOfTemplate, `<!--
  OpenActive Dataset Site Template version ${process.env.npm_package_version}, from https://github.com/openactive/dataset-site-template/tags/v${process.env.npm_package_version}${!embed ? `
  
  This HTML file must reference a self-hosted '${stylesFile}' file, co-located with the rest
  of the static assets from the following archive:
  https://unpkg.com/@openactive/dataset-site-template@${process.env.npm_package_version}/dist/datasetsite-csp.static.zip` : ''}
-->`);
  
  return replaceStylesPlaceholderWithContent(templateOfTemplate, stylesHtml);
}

module.exports = {
  renderTemplate,
  getStylesDestinationFileName,
  getStylesSourceFileName
};
