// dependencies required
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

// db config
const dbConfig = require('./config/db')
mongoose.Promise = global.Promise

const app = express()

// Port to run the server
var port = process.env.PORT || 8000

// parser to parse url-encoded forms
app.use(bodyParser.urlencoded({ extended: true }))

// Required routes
require('./app/routes')(app)

// Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log("Successfully connected to the database");

    // Run the server
    app.listen(port, () => {
      console.log("Listening on Port: " + port)
    })
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});
