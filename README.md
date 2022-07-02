# dataset-site-template [![npm version](https://img.shields.io/npm/v/@openactive/dataset-site-template)](https://www.npmjs.com/package/@openactive/dataset-site-template) [![Build](https://github.com/openactive/dataset-site-template/actions/workflows/deploy.yml/badge.svg?branch=master)](https://github.com/openactive/dataset-site-template/actions/workflows/deploy.yml)

## About
This repository contains a mustache template for creating an OpenActive dataset site, similar to those that can be found at https://status.openactive.io.

It is designed to be embedded in a booking system, and easily customised.

## Getting started

Please see here for full documentation: https://developer.openactive.io/publishing-data/dataset-sites

## How it works

### Templates available

There are two templates available, depending on your use case.

### Option 1: Embedded single-file template
This file contains stylesheets and images embedded in a single file, referencing Cloudflare and Google CDNs for fonts. It is useful for implementations where hosting static files is problematic.

1. Use one of the options below to dynamically render the embedded 'single-file template' and output it at an endpoint, for example `https://example.com/openactive/`.

### Option 2: CSP compatible template with separate static files
This template must be rendered using a reference to a statically hosted stylesheet. This is useful for implementations that have a [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) in place.

1. Host the [CSP compatible template static files](https://openactive.io/dataset-site-template/datasetsite-csp.static.zip) somewhere on the same domain as your dataset site.
2. Use one of the options below to dynamically render the 'CSP compatible template' ensuring that the "`stylesheetUrl`" references the location of the `datasetsite.styles.css` file (this can be a relative or absolute URL), including a reference to the stylesheet in the static files that you are hosting. 
3. Output the template at an endpoint, for example `https://example.com/openactive/`. 


## Options for template rendering

### Render with npm
```
npm install @openactive/dataset-site-template
```

See [Usage for npm](#npm--nodejs)

### Render via CLI
```
npx @openactive/dataset-site-template example.jsonld output.html
```

See [Usage for CLI](#cli-static-file-generator)

### Other languages

There are [various libraries available](https://developer.openactive.io/publishing-data/dataset-sites#.net-php-ruby-and-javascript-typescript-libraries) that handle template rendering in a variety of languages.

For example, for C# .NET:
- [This library](https://github.com/openactive/OpenActive.DatasetSite.NET/) contains helpers that handle the above automatically.
- [This repository](https://github.com/openactive/dataset-site-template-example-dotnet) contains example rendering logic example written in C#.

### Manual template downloads

See [Usage for manual rendering](#manual-rendering)


## NPM / Node.JS

### `renderDatasetSite(jsonld, stylesheetUrl)`

This function renders the dataset site from a given JSON-LD object, such [example.jsonld](https://validator.openactive.io/?url=https%3A%2F%2Fopenactive.io%2Fdataset-site-template%2Fexample.jsonld&version=2.x&validationMode=DatasetSite).

If `stylesheetUrl` is provided it will use the [CSP compatible template](#option-2-csp-compatible-template-with-separate-static-files), otherwise it will use the [single-file template](#option-1-embedded-single-file-template).

Note that the JSON-LD should be of type `Dataset`, which can be validated with the [OpenActive Validator](https://validator.openactive.io/?url=https%3A%2F%2Fopenactive.io%2Fdataset-site-template%2Fexample.jsonld&version=2.x&validationMode=DatasetSite) and also by the [`models-ts`](https://github.com/openactive/models-ts) library.

```js
const { renderDatasetSite } = require('@openactive/dataset-site-template');

/* Render OpenActive Dataset Site */
app.get('openactive', async (req, res) => {
   /** @type {import('@openactive/models-ts').Dataset} */
   const jsonld = {...};
   return await renderDatasetSite(jsonld);
});
```

### `getDatasetSiteTemplate(singleFileMode)`

This function returns a string containing the appropriate template file.

If `singleFileMode` is `false` or omitted it will use the [CSP compatible template](#option-2-csp-compatible-template-with-separate-static-files)), otherwise it will use the [single-file template](#option-1-embedded-single-file-template).


## CLI static file generator
Use `npx @openactive/dataset-site-template` to generate a Dataset Site HTML file that can be statically hosted. This can be useful for single database systems where the contents of the dataset site will not change per-customer.

You will need to supply a JSON-LD file, such [example.jsonld](https://validator.openactive.io/?url=https%3A%2F%2Fopenactive.io%2Fdataset-site-template%2Fexample.jsonld&version=2.x&validationMode=DatasetSite) based on your organisation.

Note that the [various libraries available](https://developer.openactive.io/publishing-data/dataset-sites#.net-php-ruby-and-javascript-typescript-libraries) are preferred to this approach where possible, as they are easier to iterate with during development, and as the Dataset API Discovery specification is [yet to be formally released](https://developer.openactive.io/publishing-data/dataset-sites#what-is-a-dataset-site).

```
Usage:
  npx @openactive/dataset-site-template <inputJsonFile> <outputHtmlFile> [stylesheetUrl]

Arguments:
  inputJsonFile: Dataset Site JSON file used to generate the Dataset Site HTML
  outputHtmlFile: Output Dataset Site HTML file, rendered using the relevant template
  stylesheetUrl: Optional. Path to the datasetsite.styles.css file, if you are hosting static files. 
    If stylesheetUrl is supplied, CSP compatible template is used, otherwise the single-file template is used.

Example:
  npx @openactive/dataset-site-template example.jsonld output.html "http://localhost:4000/static/datasetsite.styles.css"
```

## Manual rendering

> Please note that there are [various libraries available](https://developer.openactive.io/publishing-data/dataset-sites#.net-php-ruby-and-javascript-typescript-libraries) that do all of the below automatically.

### Downloads

- NOTE: DO NOT DOWNLOAD THE MUSTACHE FILE LIVE, IT MUST BE SAVED LOCALLY TO PREVENT XSS ATTACKS
- NOTE: DO NOT RENDER THIS FILE CLIENT-SIDE, IT MUST BE RENDERED SERVER-SIDE FOR SEO AND MACHINE READABILITY

Use one of these downloads for rendering the template manually:

Downloads for [Single-file template](#option-1-embedded-single-file-template):

  - [⬇️  Download single-file template](https://openactive.io/dataset-site-template/datasetsite.mustache)

Downloads for [CSP compatible template](#option-2-csp-compatible-template-with-separate-static-files):

  - [⬇️  Download CSP compatible template](https://openactive.io/dataset-site-template/datasetsite-csp.mustache)
  - [⬇️  Download static files](https://openactive.io/dataset-site-template/datasetsite-csp.static.zip)


### Steps to render

First construct the JSON-LD found in [example.jsonld](https://openactive.io/dataset-site-template/example.jsonld) based on your organisation (for single database systems) or your customers' own properties (for multiple database systems), then process it with the following steps:

1. Stringify the input JSON, and place the contents of the string within the `"jsonld"` property at the root of the JSON itself.
   - **This is important as it is used to populate the machine-readable `<script type="application/ld+json">` tag within the generated HTML - view the source of [this page](https://reference-implementation.openactive.io/OpenActive) to see an example.**
2. If using static hosted files, set the `"stylesheetUrl"` property at the root of the JSON to the relative path of the stylesheet. Note this must take place after Step 1 so that this property is not included in the machine-readable JSON-LD.
3. Use the resulting JSON with the mustache template to render the dataset site.

### JavaScript prototype
[This sample](https://jsfiddle.net/nickevansuk/msby0vqg/) contains a prototype of the logic above written in JavaScript.

PLEASE NOTE: **This is only an example to demonstrate the logic and is not intended for production use**. The mustache template **must** be **copied locally** and **rendered server-side** for production use, for security (to prevent XSS attacks), and as its primary purposes are SEO and machine readability.

## Contribution

Contributions to this project are welcome.

The `datasetsite.mustache.template` and `datasetsite.styles.css` files are used to create the two different templates available for download.

When making changes, to preview the template files simply run `npm install` and then `npm run build`. This script is also run by CI on `master`, and the resulting templates automatically deployed to GitHub Pages and NPM.

When developing the templates `npm run watch` can be used to run a live test harness to preview changes in real-time.
