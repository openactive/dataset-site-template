const express = require('express');
const path = require('path');
const Mustache = require('mustache');
const fs = require('fs');
const app = express();
const port = 4000;
const { renderTemplate } = require('../templateRenderer/renderTemplate.js');


app.use(function (req, res, next) {
  res.setHeader(
    'Content-Security-Policy-Report-Only',
    "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'"
  );
  next();
});

app.use(express.static(path.join(__dirname + '/../')));

app.get('/:datasetSiteIdentifier/:exampleIdentifier/:embed', (req, res) => {
  const { exampleIdentifier, datasetSiteIdentifier, embed } = req.params;
    
  if (!datasetSiteIdentifier) {
    res.status(404).json({
      error: `Dataset template "${datasetSiteIdentifier}" was not found`,
    });
  }
  if (!exampleIdentifier) {
    res.status(404).json({
      error: `Template "${exampleIdentifier}" was not found`,
    });
  }
  if (!embed) {
    res.status(404).json({
      error: `Embed mode must be specified`,
    });
  }

  // The entire data object needs to be included in the dataset site so the OpenActive parser can read it
  var data = JSON.parse(fs.readFileSync(`./jsonld-samples/${exampleIdentifier}.jsonld`, { encoding:'utf8' }));
  // Create a `json` property containing `example.jsonld` so that Mustache can read it
  data.jsonld = JSON.stringify(data, null, 2);

  const isEmbeddingEnabled = embed === 'embed';

  if (!isEmbeddingEnabled) {
    // Create a `stylesheetUrl` property containing the path to the stylesheet so that Mustache can read it
    data.stylesheetUrl = `/static/${datasetSiteIdentifier}.styles.css`;
  }

  // Render the template live (note this is the same as build.js)
  var template = renderTemplate(datasetSiteIdentifier, isEmbeddingEnabled);

  // Use the resulting JSON with the mustache template to render the dataset site.
  var html = Mustache.render(template, data);
  res.send(html)
})

app.listen(port, () => {
  console.log(`Test harness listening on port ${port}.\n\nUsage: http://localhost:${port}/<datasetSiteIdentifier>/<exampleIdentifier>/<embed|noembed>\n\nExample: http://localhost:${port}/datasetsite/example/noembed`)
})