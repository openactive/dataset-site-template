const fs = require('fs');

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
  return input.replace(/<!-- STYLES PLACEHOLDER -->/g, (match, $1) => {
    return content;
  });
}

function renderTemplate(datasetSiteIdentifier, embed) {
  // Get template of the template
  let templateOfTemplate;
  try {
    templateOfTemplate = fs.readFileSync(`./src/templates/${datasetSiteIdentifier}.mustache.template`, { encoding:'utf8' });
  } catch {
    templateOfTemplate = fs.readFileSync(`./src/templates/archive/${datasetSiteIdentifier}.mustache`, { encoding:'utf8' });
  }

  // Render styles depending on whether or not embedding is enabled
  const stylesHtml = embed ?
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,600" crossorigin="anonymous">
    <style>${replaceReferencesWithEmbedsAndRemoveFonts(fs.readFileSync(`./src/static/${datasetSiteIdentifier}.styles.css`, { encoding:'utf8' }))}</style>` :
    '<link rel="stylesheet" href="{{{stylesheetUrl}}}" crossorigin="anonymous">';
  
  return replaceStylesPlaceholderWithContent(templateOfTemplate, stylesHtml);
}

module.exports = {
  renderTemplate,
};
