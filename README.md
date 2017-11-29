# HTML To PDF

This is a proof of concept. It turns HTML into PDFs by way of Chrome. It run's a headless version of the browser to render the HTML and then it use's the debug tools provided mechanism for pulling a rendered PDF.

The target environment is AWS Lambda.

## Development

To contribute start by forking the repo, and making sure you have a modern version of node installed. Then you can initialize the dev environment.

```
make init
```

## Tests

```
make tests
```
