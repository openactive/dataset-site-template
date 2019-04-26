# dataset-site-template

## About
This repository contains a [mustache template](https://www.openactive.io/dataset-site-template/datasetsite.mustache) for creating an OpenActive dataset site, similar to those that can be found at https://status.openactive.io.

It is designed to be embedded in a booking system that outputs one open data feed for each customer, and allows the booking system to easily generate a feed for each customer.

## Getting Started

Simply construct the JSON-LD found in [example.json](https://www.openactive.io/dataset-site-template/example.json) based on your customers' own properties, then process it with the following steps.



Steps to render the template:

1. Stringify the input JSON, and place the contents of the string within the "json" property at the root of the JSON itself.
2. Use the resulting JSON with the mustache template to render the dataset site.

## Examples

### C# .NET
[This repository](https://github.com/openactive/dataset-site-template-example-dotnet) contains a full example written in C#.

### JavaScript
[This sample](https://jsfiddle.net/nickevansuk/msby0vqg/12/) contains a full example written in JavaScript.
