// dependencies required
const express = require('express')
const MongoClient = require('mongodb').MongoClient
const bodyParser = require('body-parser')

const app = express()

// Port to run the server
var port = process.env.PORT || 8000;

// Routes
require('./app/routes')(app, {});

// Run the server
app.listen(port, () => {
  console.log("Listening on Port: " + port);
})
