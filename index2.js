const express = require('express');
const app = express();
const port = 4000;

app.get('/', (req, res, next) => {
  const isi = false;
  if (isi) {
    res.send('Hello World!');
    console.log('Accessing the secret section ...');
    next(); // pass control to the next handler
  } else {
    res.status(500);
    res.send('Error!');
    console.log('Error');
    next();
  }
});

app.post('/', function (req, res) {
  res.send('Got a POST request');
});

app.put('/', function (req, res) {
  res.send('Got a PUT request at /');
});

app.patch('/', function (req, res) {
  res.send('Got a PATCH request at /');
});

app.delete('/', function (req, res) {
  res.send('Got a DELETE request at /');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
