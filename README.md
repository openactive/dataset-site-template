# dataset-site-template

## About
This repository contains a [mustache template](https://openactive.io/dataset-site-template/datasetsite.mustache) for creating an OpenActive dataset site, similar to those that can be found at https://status.openactive.io.

It is designed to be embedded in a booking system, and easily customised.

## Important notes for production use

- DO NOT DOWNLOAD THE MUSTACHE FILE LIVE, IT MUST BE SAVED LOCALLY TO PREVENT XSS ATTACKS
- DO NOT RENDER THIS FILE CLIENT-SIDE, IT MUST BE RENDERED SERVER-SIDE FOR SEO

## Getting Started

Simply construct the JSON-LD found in [example.json](https://openactive.io/dataset-site-template/example.json) based on your organisation (for single database systems) or your customers' own properties (for multiple database systems), then process it with the following steps.

Steps to render the template:

1. Stringify the input JSON, and place the contents of the string within the "json" property at the root of the JSON itself.
2. Use the resulting JSON with the mustache template to render the dataset site.

## Examples

### C# .NET
[This library](https://github.com/openactive/OpenActive.DatasetSite.NET/) contains helpers that handle the above automatically.
[This repository](https://github.com/openactive/dataset-site-template-example-dotnet) contains example rendering logic example written in C#.

### JavaScript
[This sample](https://jsfiddle.net/nickevansuk/msby0vqg/) contains a full example written in JavaScript.
