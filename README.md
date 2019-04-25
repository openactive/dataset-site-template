# dataset-site-template

## About
This repository contains a template for creating a dataset site, similar to those that can be found at https://status.openactive.io.

It is designed to be embedded in a booking system that outputs one open data feed for each customer, and allows the booking system to easily generate a feed for each customer.

## Getting Started

Simply construct the JSON-LD found in [example.json](https://www.openactive.io/dataset-site-template/example.json) based on your customers' own properties, then process it as follows. If you're using .NET you can do this via strong typing using [OpenActive.NET](https://www.nuget.org/packages/OpenActive.NET/).

Steps to process:
- Stringify the JSON file, and place the contents of the string within the "json" property at the root of the JSON.
- Use the resulting JSON with the mustache template to render the dataset site.

